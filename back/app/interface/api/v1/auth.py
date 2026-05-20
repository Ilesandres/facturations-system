import os
from datetime import datetime, timedelta
from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from ...schemas.auth_schema import RegisterRequest, LoginRequest, AuthResponse
from ....application.use_cases.registrar_usuario import RegistrarUsuarioCasoUso
from ....application.use_cases.autenticar_usuario import AutenticarUsuarioCasoUso
from ....application.ports.usuario_repositorio import UsuarioRepositorio
from ....domain.value_objects.rol import Rol
from ....infrastructure.adapters.cassandra.rol_repositorio_impl import (
    RolRepositorioCassandra,
)
from ....infrastructure.adapters.cassandra.usuario_repositorio_impl import (
    UsuarioRepositorioCassandra,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET", "supersecret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas


def _get_repo() -> UsuarioRepositorio:
    return UsuarioRepositorioCassandra()


def crear_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credenciales.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        repo = _get_repo()
        usuario = await repo.obtener_por_id(usuario_id)
        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "rol_id": usuario.rol_id,
            "avatar_url": usuario.avatar_url,
            "tienda_id": usuario.tienda_id,
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


async def get_usuario_opcional(
    credenciales: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
) -> dict | None:
    if not credenciales:
        return None
    try:
        payload = jwt.decode(credenciales.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            return None
        repo = _get_repo()
        usuario = await repo.obtener_por_id(usuario_id)
        if not usuario:
            return None
        return {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "rol_id": usuario.rol_id,
            "avatar_url": usuario.avatar_url,
            "tienda_id": usuario.tienda_id,
        }
    except JWTError:
        return None


def require_rol(*roles_requeridos: str):
    async def _validator(usuario: dict = Depends(get_usuario_actual)) -> dict:
        if usuario["rol"] not in roles_requeridos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de los roles: {', '.join(roles_requeridos)}",
            )
        return usuario
    return _validator


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest):
    caso_uso = RegistrarUsuarioCasoUso(_get_repo())
    rol_repo = RolRepositorioCassandra()
    try:
        rol_entity = await rol_repo.obtener_por_nombre(body.rol)
        rol_id = rol_entity.id if rol_entity else ""
        usuario = await caso_uso.ejecutar(
            nombre=body.nombre,
            email=body.email,
            password=body.password,
            telefono=body.telefono,
            rol=body.rol,
            rol_id=rol_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = crear_token({"sub": usuario.id, "email": usuario.email, "rol": usuario.rol, "rol_id": usuario.rol_id})
    return AuthResponse(
        access_token=token,
        usuario={
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "rol_id": usuario.rol_id,
            "avatar_url": usuario.avatar_url,
            "tienda_id": usuario.tienda_id,
        },
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    caso_uso = AutenticarUsuarioCasoUso(_get_repo())
    try:
        usuario_data = await caso_uso.ejecutar(email=body.email, password=body.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    token = crear_token({"sub": usuario_data["id"], "email": usuario_data["email"], "rol": usuario_data["rol"], "rol_id": usuario_data["rol_id"]})
    return AuthResponse(access_token=token, usuario=usuario_data)


@router.get("/me")
async def me(usuario: dict = Depends(get_usuario_actual)):
    return usuario
