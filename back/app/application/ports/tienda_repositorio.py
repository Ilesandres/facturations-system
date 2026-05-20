from abc import ABC, abstractmethod
from typing import Optional

from ...domain.entities.tienda import Tienda


class TiendaRepositorio(ABC):
    @abstractmethod
    async def guardar(self, tienda: Tienda) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, tienda_id: str) -> Optional[Tienda]: ...

    @abstractmethod
    async def obtener_por_vendedor(self, vendedor_id: str) -> Optional[Tienda]: ...

    @abstractmethod
    async def listar_todos(self) -> list[Tienda]: ...

    @abstractmethod
    async def eliminar(self, tienda_id: str) -> None: ...

    @abstractmethod
    async def listar_eliminados(self) -> list[Tienda]: ...

    @abstractmethod
    async def restaurar(self, tienda_id: str) -> None: ...
