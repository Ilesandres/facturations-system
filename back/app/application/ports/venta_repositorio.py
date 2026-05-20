from abc import ABC, abstractmethod
from datetime import date
from ...domain.entities.venta import Venta


class VentaRepositorio(ABC):
    @abstractmethod
    async def guardar(self, venta: Venta) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, venta_id: str) -> Venta | None: ...

    @abstractmethod
    async def listar_por_persona(self, persona_id: str) -> list[Venta]: ...

    @abstractmethod
    async def listar_por_fecha(self, desde: date, hasta: date) -> list[Venta]: ...
