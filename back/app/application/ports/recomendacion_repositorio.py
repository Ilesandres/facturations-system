from abc import ABC, abstractmethod
from ...domain.entities.recomendacion import RecomendacionCliente


class RecomendacionRepositorio(ABC):
    @abstractmethod
    async def recomendar_por_cercania(
        self, persona_id: str, radio_km: float = 5.0, limite: int = 5
    ) -> list[RecomendacionCliente]: ...
