from dataclasses import dataclass
from ..value_objects.dinero import Dinero


@dataclass
class Producto:
    id: str
    nombre: str
    descripcion: str
    precio: Dinero
    stock: int
    categoria: str
    image_url: str = ""
    vendedor_id: str = ""

    def descontar_stock(self, cantidad: int) -> None:
        if cantidad > self.stock:
            raise ValueError(f"Stock insuficiente: disponible {self.stock}, solicitado {cantidad}")
        self.stock -= cantidad

    def actualizar_precio(self, nuevo_precio: Dinero) -> None:
        self.precio = nuevo_precio
