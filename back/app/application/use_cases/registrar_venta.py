from datetime import datetime
from typing import Optional
from uuid import uuid4

from ...domain.entities.venta import Venta, DetalleFactura
from ...domain.value_objects.dinero import Dinero
from ..ports.producto_repositorio import ProductoRepositorio
from ..ports.recomendacion_repositorio import RecomendacionRepositorio
from ..ports.venta_repositorio import VentaRepositorio


class RegistrarVentaCasoUso:
    def __init__(
        self,
        venta_repositorio: VentaRepositorio,
        producto_repositorio: ProductoRepositorio,
        recomendacion_repositorio: Optional[RecomendacionRepositorio] = None,
    ):
        self._venta_repo = venta_repositorio
        self._producto_repo = producto_repositorio
        self._recomendacion_repo = recomendacion_repositorio

    async def ejecutar(
        self,
        persona_id: str,
        items: list[dict],
        usuario_id: Optional[str] = None,
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

            if self._recomendacion_repo and usuario_id:
                await self._recomendacion_repo.registrar_compra(
                    usuario_id=usuario_id,
                    producto_id=producto.id,
                    categoria_id=producto.categoria_id,
                    vendedor_id=producto.vendedor_id,
                    nombre=producto.nombre,
                    precio=producto.precio.monto,
                    image_url=producto.image_url,
                )

        venta = Venta(
            id=str(uuid4()),
            persona_id=persona_id,
            fecha=datetime.now(),
            detalles=detalles,
        )
        await self._venta_repo.guardar(venta)
        return venta
