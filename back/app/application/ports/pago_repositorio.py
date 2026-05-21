from abc import ABC, abstractmethod
from ...domain.entities.pago import Pago, MetodoPago


class PagoRepositorio(ABC):
    @abstractmethod
    async def guardar(self, pago: Pago) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, pago_id: str) -> Pago | None: ...

    @abstractmethod
    async def listar_por_factura(self, factura_id: str) -> list[Pago]: ...


class MetodoPagoRepositorio(ABC):
    @abstractmethod
    async def listar_todos(self) -> list[MetodoPago]: ...

    @abstractmethod
    async def obtener_por_id(self, metodo_pago_id: str) -> MetodoPago | None: ...
