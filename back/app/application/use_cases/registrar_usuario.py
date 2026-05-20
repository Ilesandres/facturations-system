import asyncio
import hashlib
from passlib.context import CryptContext
from uuid import uuid4

from ...domain.entities.usuario import Usuario
from ...domain.value_objects.ubicacion import Ubicacion
from ...domain.value_objects.rol import Rol, ROLES_REGISTRABLES
from ..ports.usuario_repositorio import UsuarioRepositorio

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegistrarUsuarioCasoUso:
    def __init__(self, repositorio: UsuarioRepositorio):
        self._repositorio = repositorio

    async def ejecutar(
        self,
        nombre: str,
        email: str,
        password: str,
        telefono: str = "",
        latitud: float = 0.0,
        longitud: float = 0.0,
        rol: str = Rol.CLIENTE,
        rol_id: str = "",
    ) -> Usuario:
        if rol not in ROLES_REGISTRABLES:
            raise ValueError(f"Rol '{rol}' no permitido. Roles válidos: {', '.join(ROLES_REGISTRABLES)}")

        existente = await self._repositorio.obtener_por_email(email)
        if existente:
            raise ValueError("El email ya está registrado")

        password_hash = await asyncio.to_thread(
            lambda: pwd_context.hash(hashlib.sha256(password.encode()).hexdigest())
        )
        usuario = Usuario(
            id=str(uuid4()),
            nombre=nombre,
            email=email,
            telefono=telefono,
            password_hash=password_hash,
            ubicacion=Ubicacion(
                latitud=latitud, longitud=longitud, direccion="", ciudad="", pais=""
            ),
            rol=rol,
            rol_id=rol_id,
        )
        await self._repositorio.guardar(usuario)
        return usuario
