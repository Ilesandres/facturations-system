from datetime import datetime
from uuid import uuid4

from ....application.ports.pago_repositorio import PagoRepositorio, MetodoPagoRepositorio
from ....domain.entities.pago import Pago, MetodoPago
from ....domain.value_objects.dinero import Dinero
from ....domain.value_objects.estado import EstadoPago
from ...config.database import DBConfig


class PagoRepositorioMySQL(PagoRepositorio):
    async def guardar(self, pago: Pago) -> None:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """INSERT INTO pagos (id, factura_id, metodo_pago_id, monto, moneda, estado, referencia, fecha_pago, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        estado = VALUES(estado),
                        referencia = VALUES(referencia),
                        fecha_pago = VALUES(fecha_pago)""",
                    (
                        pago.id,
                        pago.factura_id,
                        pago.metodo_pago_id,
                        pago.monto.monto,
                        pago.monto.moneda,
                        pago.estado.value,
                        pago.referencia,
                        pago.fecha_pago,
                        pago.created_at,
                    ),
                )

    async def obtener_por_id(self, pago_id: str) -> Pago | None:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, factura_id, metodo_pago_id, monto, moneda, estado, referencia, fecha_pago, created_at FROM pagos WHERE id = %s",
                    (pago_id,),
                )
                row = await cur.fetchone()
                if not row:
                    return None
                return self._mapear(row)

    async def listar_por_factura(self, factura_id: str) -> list[Pago]:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, factura_id, metodo_pago_id, monto, moneda, estado, referencia, fecha_pago, created_at FROM pagos WHERE factura_id = %s ORDER BY created_at ASC",
                    (factura_id,),
                )
                rows = await cur.fetchall()
                return [self._mapear(r) for r in rows]

    def _mapear(self, row) -> Pago:
        return Pago(
            id=row[0],
            factura_id=row[1],
            metodo_pago_id=row[2],
            monto=Dinero(monto=float(row[3]), moneda=row[4]),
            estado=EstadoPago(row[5]),
            referencia=row[6] or "",
            fecha_pago=row[7] if isinstance(row[7], datetime) else None,
            created_at=row[8] if isinstance(row[8], datetime) else datetime.utcnow(),
        )


class MetodoPagoRepositorioMySQL(MetodoPagoRepositorio):
    async def listar_todos(self) -> list[MetodoPago]:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT id, nombre, descripcion, activo FROM metodos_pago WHERE activo = true")
                rows = await cur.fetchall()
                return [MetodoPago(id=r[0], nombre=r[1], descripcion=r[2] or "", activo=r[3]) for r in rows]

    async def obtener_por_id(self, metodo_pago_id: str) -> MetodoPago | None:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, nombre, descripcion, activo FROM metodos_pago WHERE id = %s",
                    (metodo_pago_id,),
                )
                row = await cur.fetchone()
                if not row:
                    return None
                return MetodoPago(id=row[0], nombre=row[1], descripcion=row[2] or "", activo=row[3])
