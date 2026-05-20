from ...domain.entities.producto import Producto
from ...domain.value_objects.dinero import Dinero
from ..ports.producto_repositorio import ProductoRepositorio
from uuid import uuid4


class CrearProductoCasoUso:
    def __init__(self, repositorio: ProductoRepositorio):
        self._repositorio = repositorio

    async def ejecutar(
        self,
        nombre: str,
        descripcion: str,
        precio: float,
        stock: int,
        categoria_id: str,
        moneda: str = "COP",
        image_url: str = "",
        vendedor_id: str = "",
    ) -> Producto:
        producto = Producto(
            id=str(uuid4()),
            nombre=nombre,
            descripcion=descripcion,
            precio=Dinero(monto=precio, moneda=moneda),
            stock=stock,
            categoria_id=categoria_id,
            image_url=image_url,
            vendedor_id=vendedor_id,
        )
        await self._repositorio.guardar(producto)
        return producto
