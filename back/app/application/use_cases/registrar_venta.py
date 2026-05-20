from datetime import datetime
from uuid import uuid4

from ...domain.entities.venta import Venta, DetalleFactura
from ...domain.value_objects.dinero import Dinero
from ..ports.venta_repositorio import VentaRepositorio
from ..ports.producto_repositorio import ProductoRepositorio


class RegistrarVentaCasoUso:
    def __init__(
        self,
        venta_repositorio: VentaRepositorio,
        producto_repositorio: ProductoRepositorio,
    ):
        self._venta_repo = venta_repositorio
        self._producto_repo = producto_repositorio

    async def ejecutar(
        self,
        persona_id: str,
        items: list[dict],
    ) -> Venta:
        detalles = []
        for item in items:
            producto = await self._producto_repo.obtener_por_id(item["producto_id"])
            if not producto:
                raise ValueError(f"Producto {item['producto_id']} no encontrado")

            producto.descontar_stock(item["cantidad"])
            await self._producto_repo.guardar(producto)

            detalle = DetalleFactura(
                id=str(uuid4()),
                producto_id=producto.id,
                nombre_producto=producto.nombre,
                cantidad=item["cantidad"],
                precio_unitario=producto.precio,
            )
            detalles.append(detalle)

        venta = Venta(
            id=str(uuid4()),
            persona_id=persona_id,
            fecha=datetime.now(),
            detalles=detalles,
        )
        await self._venta_repo.guardar(venta)
        return venta
