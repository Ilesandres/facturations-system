from fastapi import APIRouter, Query
from ...schemas.recomendacion_schema import RecomendacionResponse
from ....application.use_cases.recomendar_clientes import RecomendarClientesCasoUso
from ....infrastructure.adapters.neo4j.recomendacion_repositorio_impl import (
    RecomendacionRepositorioNeo4j,
)

router = APIRouter(prefix="/recomendaciones", tags=["Recomendaciones"])


@router.get("/{persona_id}", response_model=list[RecomendacionResponse])
async def recomendar_clientes(
    persona_id: str,
    radio_km: float = Query(5.0, description="Radio en kilómetros"),
    limite: int = Query(5, description="Máximo de recomendaciones"),
):
    repositorio = RecomendacionRepositorioNeo4j()
    caso_uso = RecomendarClientesCasoUso(repositorio)
    resultados = await caso_uso.ejecutar(
        persona_id=persona_id,
        radio_km=radio_km,
        limite=limite,
    )
    return [
        RecomendacionResponse(
            persona_id=r.persona_id,
            nombre=r.nombre,
            email=r.email,
            distancia_km=r.distancia_km,
            motivo=r.motivo,
        )
        for r in resultados
    ]
