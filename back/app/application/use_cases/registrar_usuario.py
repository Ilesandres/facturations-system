import hashlib
from passlib.context import CryptContext
from uuid import uuid4

from ...domain.entities.usuario import Usuario
from ...domain.value_objects.ubicacion import Ubicacion
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
        tipo: str = "cliente",
    ) -> Usuario:
        existente = await self._repositorio.obtener_por_email(email)
        if existente:
            raise ValueError("El email ya está registrado")

        usuario = Usuario(
            id=str(uuid4()),
            nombre=nombre,
            email=email,
            telefono=telefono,
            password_hash=pwd_context.hash(hashlib.sha256(password.encode()).hexdigest()),
            ubicacion=Ubicacion(
                latitud=latitud, longitud=longitud, direccion="", ciudad="", pais=""
            ),
            tipo=tipo,
        )
        await self._repositorio.guardar(usuario)
        return usuario
