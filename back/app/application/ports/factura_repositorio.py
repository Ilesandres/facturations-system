from abc import ABC, abstractmethod
from ...domain.entities.factura import Factura


class FacturaRepositorio(ABC):
    @abstractmethod
    async def guardar(self, factura: Factura) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, factura_id: str) -> Factura | None: ...

    @abstractmethod
    async def listar_por_usuario(self, usuario_id: str) -> list[Factura]: ...

    @abstractmethod
    async def listar_todos(self) -> list[Factura]: ...
