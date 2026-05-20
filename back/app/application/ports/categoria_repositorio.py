from abc import ABC, abstractmethod
from ...domain.entities.categoria import Categoria


class CategoriaRepositorio(ABC):
    @abstractmethod
    async def guardar(self, categoria: Categoria) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, categoria_id: str) -> Categoria | None: ...

    @abstractmethod
    async def listar_todos(self, skip: int = 0, limit: int = 100) -> list[Categoria]: ...

    @abstractmethod
    async def eliminar(self, categoria_id: str) -> None: ...

    @abstractmethod
    async def listar_eliminados(self) -> list[Categoria]: ...

    @abstractmethod
    async def restaurar(self, categoria_id: str) -> None: ...

    @abstractmethod
    async def contar(self) -> int: ...
