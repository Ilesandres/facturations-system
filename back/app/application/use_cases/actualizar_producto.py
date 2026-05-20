from typing import Optional

from ...domain.entities.producto import Producto
from ...domain.value_objects.dinero import Dinero
from ..ports.producto_repositorio import ProductoRepositorio


class ActualizarProductoCasoUso:
    def __init__(self, repositorio: ProductoRepositorio):
        self._repositorio = repositorio

    async def ejecutar(
        self,
        producto_id: str,
        nombre: Optional[str] = None,
        descripcion: Optional[str] = None,
        precio: Optional[float] = None,
        moneda: Optional[str] = None,
        stock: Optional[int] = None,
        categoria_id: Optional[str] = None,
        image_url: Optional[str] = None,
        vendedor_id: str = "",
    ) -> Producto:
        producto = await self._repositorio.obtener_por_id(producto_id)
        if not producto:
            raise ValueError("Producto no encontrado")

        if vendedor_id and producto.vendedor_id and producto.vendedor_id != vendedor_id:
            raise ValueError("No tienes permiso para modificar este producto")

        producto.nombre = nombre if nombre is not None else producto.nombre
        producto.descripcion = descripcion if descripcion is not None else producto.descripcion
        producto.stock = stock if stock is not None else producto.stock
        producto.categoria_id = categoria_id if categoria_id is not None else producto.categoria_id
        producto.image_url = image_url if image_url is not None else producto.image_url

        if precio is not None:
            new_moneda = moneda if moneda is not None else producto.precio.moneda
            producto.precio = Dinero(monto=precio, moneda=new_moneda)
        elif moneda is not None:
            producto.precio = Dinero(monto=producto.precio.monto, moneda=moneda)

        await self._repositorio.guardar(producto)
        return producto
