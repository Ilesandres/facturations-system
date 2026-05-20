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
            "INSERT INTO tiendas (id, nombre, vendedor_id, descripcion, avatar_url, telefono, direccion) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (
                tienda.id,
                tienda.nombre,
                tienda.vendedor_id,
                tienda.descripcion,
                tienda.avatar_url,
                tienda.telefono,
                tienda.direccion,
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
        return self._mapear(row)

    async def obtener_por_vendedor(self, vendedor_id: str) -> Tienda | None:
        row = await asyncio.to_thread(
            lambda: self._session.execute(
                "SELECT * FROM tiendas WHERE vendedor_id = %s ALLOW FILTERING", (vendedor_id,)
            ).one()
        )
        if not row:
            return None
        return self._mapear(row)

    def _mapear(self, row) -> Tienda:
        return Tienda(
            id=row.id,
            nombre=row.nombre,
            vendedor_id=row.vendedor_id,
            descripcion=row.descripcion or "",
            avatar_url=row.avatar_url or "",
            telefono=row.telefono or "",
            direccion=row.direccion or "",
        )
