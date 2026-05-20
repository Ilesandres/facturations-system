from abc import ABC, abstractmethod
from ...domain.entities.producto import Producto


class ProductoRepositorio(ABC):
    @abstractmethod
    async def guardar(self, producto: Producto) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, producto_id: str) -> Producto | None: ...

    @abstractmethod
    async def listar_todos(self) -> list[Producto]: ...

    @abstractmethod
    async def buscar_por_categoria(self, categoria: str) -> list[Producto]: ...

    @abstractmethod
    async def eliminar(self, producto_id: str) -> None: ...
