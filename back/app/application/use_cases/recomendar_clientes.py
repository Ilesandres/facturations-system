from ...domain.entities.recomendacion import RecomendacionCliente
from ..ports.recomendacion_repositorio import RecomendacionRepositorio


class RecomendarClientesCasoUso:
    def __init__(self, repositorio: RecomendacionRepositorio):
        self._repositorio = repositorio

    async def ejecutar(
        self, persona_id: str, radio_km: float = 5.0, limite: int = 5
    ) -> list[RecomendacionCliente]:
        return await self._repositorio.recomendar_por_cercania(
            persona_id=persona_id,
            radio_km=radio_km,
            limite=limite,
        )
