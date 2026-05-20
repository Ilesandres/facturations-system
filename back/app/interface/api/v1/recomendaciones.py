from fastapi import APIRouter, Depends, Query
from ...schemas.recomendacion_schema import (
    RecomendacionProductoResponse,
    RecomendacionResponse,
)
from ....application.use_cases.recomendar_clientes import RecomendarClientesCasoUso
from ....application.use_cases.recomendar_productos import RecomendarProductosCasoUso
from ....infrastructure.adapters.mongodb.producto_repositorio_impl import (
    ProductoRepositorioMongo,
)
from ....infrastructure.adapters.neo4j.recomendacion_repositorio_impl import (
    RecomendacionRepositorioNeo4j,
)
from .auth import get_usuario_actual

router = APIRouter(prefix="/recomendaciones", tags=["Recomendaciones"])


@router.get("/productos", response_model=list[RecomendacionProductoResponse])
async def recomendar_productos(
    limite: int = Query(10, description="Máximo de recomendaciones"),
    usuario: dict = Depends(get_usuario_actual),
):
    caso_uso = RecomendarProductosCasoUso(
        RecomendacionRepositorioNeo4j(),
        ProductoRepositorioMongo(),
    )
    resultados = await caso_uso.ejecutar(
        usuario_id=usuario["id"],
        limite=limite,
    )
    return [
        RecomendacionProductoResponse(
            producto_id=r["producto_id"],
            nombre=r.get("nombre"),
            precio=r.get("precio"),
            categoria_id=r.get("categoria_id"),
            vendedor_id=r.get("vendedor_id"),
            image_url=r.get("image_url"),
            score=r.get("score", 0),
        )
        for r in resultados
    ]


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
