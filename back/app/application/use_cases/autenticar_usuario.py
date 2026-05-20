import hashlib
from passlib.context import CryptContext
from ..ports.usuario_repositorio import UsuarioRepositorio

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AutenticarUsuarioCasoUso:
    def __init__(self, repositorio: UsuarioRepositorio):
        self._repositorio = repositorio

    async def ejecutar(self, email: str, password: str) -> dict:
        from ...domain.entities.usuario import Usuario

        usuario = await self._repositorio.obtener_por_email(email)
        if not usuario:
            raise ValueError("Credenciales inválidas")

        if not pwd_context.verify(hashlib.sha256(password.encode()).hexdigest(), usuario.password_hash):
            raise ValueError("Credenciales inválidas")

        return {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "tipo": usuario.tipo,
            "avatar_url": usuario.avatar_url,
            "tienda_id": usuario.tienda_id,
        }
