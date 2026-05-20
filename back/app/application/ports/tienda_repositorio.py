from abc import ABC, abstractmethod
from typing import Optional

from ...domain.entities.tienda import Tienda


class TiendaRepositorio(ABC):
    @abstractmethod
    async def guardar(self, tienda: Tienda) -> None:
        ...

    @abstractmethod
    async def obtener_por_id(self, tienda_id: str) -> Optional[Tienda]:
        ...

    @abstractmethod
    async def obtener_por_vendedor(self, vendedor_id: str) -> Optional[Tienda]:
        ...
