import asyncio

from ....application.ports.tienda_repositorio import TiendaRepositorio
from ....domain.entities.tienda import Tienda
from ...config.database import DBConfig


class TiendaRepositorioCassandra(TiendaRepositorio):
    def __init__(self):
        self._session = DBConfig.get_cassandra_session()

    async def guardar(self, tienda: Tienda) -> None:
        await asyncio.to_thread(
            self._session.execute,
            "INSERT INTO tiendas (id, nombre, vendedor_id, descripcion, avatar_url, telefono, direccion, activo) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (
                tienda.id,
                tienda.nombre,
                tienda.vendedor_id,
                tienda.descripcion,
                tienda.avatar_url,
                tienda.telefono,
                tienda.direccion,
                tienda.activo,
            ),
        )

    async def obtener_por_id(self, tienda_id: str) -> Tienda | None:
        row = await asyncio.to_thread(
            lambda: self._session.execute(
                "SELECT * FROM tiendas WHERE id = %s", (tienda_id,)
            ).one()
        )
        if not row:
            return None
        t = self._mapear(row)
        if not t.activo:
            return None
        return t

    async def obtener_por_vendedor(self, vendedor_id: str) -> Tienda | None:
        row = await asyncio.to_thread(
            lambda: self._session.execute(
                "SELECT * FROM tiendas WHERE vendedor_id = %s ALLOW FILTERING", (vendedor_id,)
            ).one()
        )
        if not row:
            return None
        t = self._mapear(row)
        if not t.activo:
            return None
        return t

    async def listar_todos(self) -> list[Tienda]:
        rows = await asyncio.to_thread(self._session.execute, "SELECT * FROM tiendas WHERE activo = true ALLOW FILTERING")
        return [self._mapear(row) for row in rows]

    async def eliminar(self, tienda_id: str) -> None:
        await asyncio.to_thread(
            self._session.execute,
            "UPDATE tiendas SET activo = false WHERE id = %s",
            (tienda_id,),
        )

    async def listar_eliminados(self) -> list[Tienda]:
        rows = await asyncio.to_thread(self._session.execute, "SELECT * FROM tiendas WHERE activo = false ALLOW FILTERING")
        return [self._mapear(row) for row in rows]

    async def restaurar(self, tienda_id: str) -> None:
        await asyncio.to_thread(
            self._session.execute,
            "UPDATE tiendas SET activo = true WHERE id = %s",
            (tienda_id,),
        )

    def _mapear(self, row) -> Tienda:
        return Tienda(
            id=row.id,
            nombre=row.nombre,
            vendedor_id=row.vendedor_id,
            descripcion=row.descripcion or "",
            avatar_url=row.avatar_url or "",
            telefono=row.telefono or "",
            direccion=row.direccion or "",
            activo=getattr(row, "activo", True),
        )
