import asyncio

from ....application.ports.usuario_repositorio import UsuarioRepositorio
from ....domain.entities.usuario import Usuario
from ....domain.value_objects.ubicacion import Ubicacion
from ...config.database import DBConfig


class UsuarioRepositorioCassandra(UsuarioRepositorio):
    def __init__(self):
        self._session = DBConfig.get_cassandra_session()

    async def guardar(self, usuario: Usuario) -> None:
        await asyncio.to_thread(
            self._session.execute,
            """
            INSERT INTO usuarios (id, nombre, email, telefono, password_hash, latitud, longitud, direccion, ciudad, pais, rol, rol_id, avatar_url, tienda_id, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                usuario.id,
                usuario.nombre,
                usuario.email,
                usuario.telefono,
                usuario.password_hash,
                usuario.ubicacion.latitud,
                usuario.ubicacion.longitud,
                usuario.ubicacion.direccion,
                usuario.ubicacion.ciudad,
                usuario.ubicacion.pais,
                usuario.rol,
                usuario.rol_id,
                usuario.avatar_url,
                usuario.tienda_id,
                usuario.activo,
            ),
        )

    async def obtener_por_id(self, usuario_id: str) -> Usuario | None:
        row = await asyncio.to_thread(
            lambda: self._session.execute(
                "SELECT * FROM usuarios WHERE id = %s", (usuario_id,)
            ).one()
        )
        if not row:
            return None
        u = self._mapear(row)
        if not u.activo:
            return None
        return u

    async def obtener_por_email(self, email: str) -> Usuario | None:
        rows = await asyncio.to_thread(
            lambda: list(self._session.execute(
                "SELECT * FROM usuarios WHERE email = %s ALLOW FILTERING", (email,)
            ))
        )
        if not rows:
            return None
        for row in rows:
            u = self._mapear(row)
            if u.activo:
                return u
        return None

    async def listar_todos(self) -> list[Usuario]:
        rows = await asyncio.to_thread(
            self._session.execute,
            "SELECT * FROM usuarios WHERE activo = true ALLOW FILTERING",
        )
        return [self._mapear(row) for row in rows]

    async def eliminar(self, usuario_id: str) -> None:
        await asyncio.to_thread(
            self._session.execute,
            "UPDATE usuarios SET activo = false WHERE id = %s",
            (usuario_id,),
        )

    def _mapear(self, row) -> Usuario:
        return Usuario(
            id=row.id,
            nombre=row.nombre,
            email=row.email,
            telefono=row.telefono,
            password_hash=row.password_hash,
            ubicacion=Ubicacion(
                latitud=row.latitud,
                longitud=row.longitud,
                direccion=row.direccion,
                ciudad=row.ciudad,
                pais=row.pais,
            ),
            rol=row.rol,
            rol_id=row.rol_id or "",
            avatar_url=row.avatar_url or "",
            tienda_id=row.tienda_id or "",
            activo=getattr(row, "activo", True),
        )
