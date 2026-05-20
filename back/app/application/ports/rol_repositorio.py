from abc import ABC, abstractmethod
from typing import Optional

from ...domain.entities.rol import Rol


class RolRepositorio(ABC):
    @abstractmethod
    async def guardar(self, rol: Rol) -> None:
        ...

    @abstractmethod
    async def obtener_por_nombre(self, nombre: str) -> Optional[Rol]:
        ...

    @abstractmethod
    async def listar_todos(self) -> list[Rol]:
        ...
