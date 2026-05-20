from datetime import date
from ....application.ports.venta_repositorio import VentaRepositorio
from ....domain.entities.venta import Venta, DetalleFactura
from ....domain.value_objects.dinero import Dinero
from ...config.database import DBConfig


class VentaRepositorioMySQL(VentaRepositorio):
    def __init__(self):
        self._pool = None

    async def _get_pool(self):
        if self._pool is None:
            self._pool = await DBConfig.get_mysql_pool()
        return self._pool

    async def guardar(self, venta: Venta) -> None:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO ventas (id, persona_id, fecha, total, moneda)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        venta.id,
                        venta.persona_id,
                        venta.fecha,
                        venta.total.monto,
                        venta.total.moneda,
                    ),
                )
                for detalle in venta.detalles:
                    await cur.execute(
                        """
                        INSERT INTO detalle_factura (id, venta_id, producto_id, nombre_producto, cantidad, precio_unitario, moneda)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            detalle.id,
                            venta.id,
                            detalle.producto_id,
                            detalle.nombre_producto,
                            detalle.cantidad,
                            detalle.precio_unitario.monto,
                            detalle.precio_unitario.moneda,
                        ),
                    )

    async def obtener_por_id(self, venta_id: str) -> Venta | None:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT * FROM ventas WHERE id = %s", (venta_id,)
                )
                venta_row = await cur.fetchone()
                if not venta_row:
                    return None
                await cur.execute(
                    "SELECT * FROM detalle_factura WHERE venta_id = %s", (venta_id,)
                )
                detalle_rows = await cur.fetchall()
                return self._mapear_venta(venta_row, detalle_rows)

    async def listar_por_persona(self, persona_id: str) -> list[Venta]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT * FROM ventas WHERE persona_id = %s", (persona_id,)
                )
                return await self._mapear_varias_ventas(cur)

    async def listar_por_fecha(self, desde: date, hasta: date) -> list[Venta]:
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT * FROM ventas WHERE fecha >= %s AND fecha <= %s",
                    (desde, hasta),
                )
                return await self._mapear_varias_ventas(cur)

    async def _mapear_varias_ventas(self, cur) -> list[Venta]:
        ventas = []
        async for venta_row in cur:
            await cur.execute(
                "SELECT * FROM detalle_factura WHERE venta_id = %s",
                (venta_row[0],),
            )
            detalle_rows = await cur.fetchall()
            ventas.append(self._mapear_venta(venta_row, detalle_rows))
        return ventas

    def _mapear_venta(self, venta_row: tuple, detalle_rows: list[tuple]) -> Venta:
        detalles = [
            DetalleFactura(
                id=dr[0],
                producto_id=dr[2],
                nombre_producto=dr[3],
                cantidad=dr[4],
                precio_unitario=Dinero(monto=float(dr[5]), moneda=dr[6]),
            )
            for dr in detalle_rows
        ]
        return Venta(
            id=venta_row[0],
            persona_id=venta_row[1],
            fecha=venta_row[2],
            detalles=detalles,
        )
