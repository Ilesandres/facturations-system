import asyncio
from datetime import datetime
from uuid import uuid4

from ....application.ports.factura_repositorio import FacturaRepositorio
from ....domain.entities.factura import Factura, DetalleFactura
from ....domain.value_objects.dinero import Dinero
from ....domain.value_objects.estado import EstadoFactura
from ...config.database import DBConfig


class FacturaRepositorioMySQL(FacturaRepositorio):
    async def guardar(self, factura: Factura) -> None:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """INSERT INTO facturas (id, persona_id, usuario_id, fecha, subtotal, impuesto, total, moneda, estado, metodo_pago_id, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        estado = VALUES(estado),
                        metodo_pago_id = VALUES(metodo_pago_id),
                        updated_at = VALUES(updated_at)""",
                    (
                        factura.id,
                        factura.persona_id,
                        factura.usuario_id,
                        factura.fecha,
                        factura.subtotal.monto,
                        factura.impuesto.monto,
                        factura.total.monto,
                        factura.subtotal.moneda,
                        factura.estado.value,
                        factura.metodo_pago_id or "",
                        factura.created_at,
                        factura.updated_at,
                    ),
                )
                for d in factura.detalles:
                    await cur.execute(
                        """INSERT INTO factura_detalles (id, factura_id, producto_id, nombre_producto, cantidad, precio_unitario, moneda)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            cantidad = VALUES(cantidad)""",
                        (
                            d.id,
                            d.factura_id,
                            d.producto_id,
                            d.nombre_producto,
                            d.cantidad,
                            d.precio_unitario.monto,
                            d.precio_unitario.moneda,
                        ),
                    )

    async def obtener_por_id(self, factura_id: str) -> Factura | None:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, persona_id, usuario_id, fecha, subtotal, impuesto, total, moneda, estado, metodo_pago_id, created_at, updated_at FROM facturas WHERE id = %s",
                    (factura_id,),
                )
                row = await cur.fetchone()
                if not row:
                    return None
                factura = self._mapear_factura(row)
                await cur.execute(
                    "SELECT id, factura_id, producto_id, nombre_producto, cantidad, precio_unitario, moneda FROM factura_detalles WHERE factura_id = %s",
                    (factura_id,),
                )
                rows = await cur.fetchall()
                factura.detalles = [self._mapear_detalle(r) for r in rows]
                return factura

    async def listar_por_usuario(self, usuario_id: str) -> list[Factura]:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, persona_id, usuario_id, fecha, subtotal, impuesto, total, moneda, estado, metodo_pago_id, created_at, updated_at FROM facturas WHERE usuario_id = %s ORDER BY fecha DESC",
                    (usuario_id,),
                )
                rows = await cur.fetchall()
                return [self._mapear_factura(r) for r in rows]

    async def listar_todos(self) -> list[Factura]:
        pool = await DBConfig.get_mysql_pool()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT id, persona_id, usuario_id, fecha, subtotal, impuesto, total, moneda, estado, metodo_pago_id, created_at, updated_at FROM facturas ORDER BY fecha DESC"
                )
                rows = await cur.fetchall()
                return [self._mapear_factura(r) for r in rows]

    def _mapear_factura(self, row) -> Factura:
        return Factura(
            id=row[0],
            persona_id=row[1],
            usuario_id=row[2],
            fecha=row[3] if isinstance(row[3], datetime) else datetime.utcnow(),
            subtotal=Dinero(monto=float(row[4]), moneda=row[7]),
            impuesto=Dinero(monto=float(row[5]), moneda=row[7]),
            total=Dinero(monto=float(row[6]), moneda=row[7]),
            estado=EstadoFactura(row[8]),
            metodo_pago_id=row[9] or "",
            created_at=row[10] if isinstance(row[10], datetime) else datetime.utcnow(),
            updated_at=row[11] if isinstance(row[11], datetime) else datetime.utcnow(),
        )

    def _mapear_detalle(self, row) -> DetalleFactura:
        return DetalleFactura(
            id=row[0],
            factura_id=row[1],
            producto_id=row[2],
            nombre_producto=row[3],
            cantidad=row[4],
            precio_unitario=Dinero(monto=float(row[5]), moneda=row[6]),
        )
