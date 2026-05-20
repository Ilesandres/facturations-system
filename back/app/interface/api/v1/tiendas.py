from fastapi import APIRouter, Depends, HTTPException

from ...schemas.tienda_schema import TiendaResponse
from ....application.ports.tienda_repositorio import TiendaRepositorio
from ....infrastructure.adapters.cassandra.tienda_repositorio_impl import (
    TiendaRepositorioCassandra,
)
from .auth import get_usuario_actual, require_rol

router = APIRouter(prefix="/tiendas", tags=["Tiendas"])


def _get_repo() -> TiendaRepositorio:
    return TiendaRepositorioCassandra()


@router.get("/{tienda_id}", response_model=TiendaResponse)
async def obtener_tienda(tienda_id: str):
    repo = _get_repo()
    tienda = await repo.obtener_por_id(tienda_id)
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return TiendaResponse(
        id=tienda.id,
        nombre=tienda.nombre,
        vendedor_id=tienda.vendedor_id,
        descripcion=tienda.descripcion,
        avatar_url=tienda.avatar_url,
        telefono=tienda.telefono,
        direccion=tienda.direccion,
    )


@router.get("/mi-tienda/mia", response_model=TiendaResponse)
async def mi_tienda(usuario: dict = Depends(get_usuario_actual)):
    if not usuario.get("tienda_id"):
        raise HTTPException(status_code=404, detail="No tienes una tienda asignada")
    repo = _get_repo()
    tienda = await repo.obtener_por_id(usuario["tienda_id"])
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return TiendaResponse(
        id=tienda.id,
        nombre=tienda.nombre,
        vendedor_id=tienda.vendedor_id,
        descripcion=tienda.descripcion,
        avatar_url=tienda.avatar_url,
        telefono=tienda.telefono,
        direccion=tienda.direccion,
    )
