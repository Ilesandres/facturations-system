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
        categoria: str,
        moneda: str = "COP",
    ) -> Producto:
        producto = Producto(
            id=str(uuid4()),
            nombre=nombre,
            descripcion=descripcion,
            precio=Dinero(monto=precio, moneda=moneda),
            stock=stock,
            categoria=categoria,
        )
        await self._repositorio.guardar(producto)
        return producto
