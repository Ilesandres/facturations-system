import asyncio

from ....application.ports.rol_repositorio import RolRepositorio
from ....domain.entities.rol import Rol
from ...config.database import DBConfig


class RolRepositorioCassandra(RolRepositorio):
    def __init__(self):
        self._session = DBConfig.get_cassandra_session()

    async def guardar(self, rol: Rol) -> None:
        await asyncio.to_thread(
            self._session.execute,
            "INSERT INTO roles (id, nombre, descripcion) VALUES (%s, %s, %s)",
            (rol.id, rol.nombre, rol.descripcion),
        )

    async def obtener_por_nombre(self, nombre: str) -> Rol | None:
        row = await asyncio.to_thread(
            lambda: self._session.execute(
                "SELECT * FROM roles WHERE nombre = %s ALLOW FILTERING", (nombre,)
            ).one()
        )
        if not row:
            return None
        return Rol(id=row.id, nombre=row.nombre, descripcion=row.descripcion)

    async def listar_todos(self) -> list[Rol]:
        rows = await asyncio.to_thread(self._session.execute, "SELECT * FROM roles")
        return [Rol(id=r.id, nombre=r.nombre, descripcion=r.descripcion) for r in rows]
