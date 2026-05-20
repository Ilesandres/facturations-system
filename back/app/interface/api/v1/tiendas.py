from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from ...schemas.tienda_schema import TiendaRequest, TiendaUpdateRequest, TiendaResponse
from ....application.ports.tienda_repositorio import TiendaRepositorio
from ....domain.entities.tienda import Tienda
from ....infrastructure.adapters.cassandra.tienda_repositorio_impl import (
    TiendaRepositorioCassandra,
)
from .auth import get_usuario_actual, require_rol

router = APIRouter(prefix="/tiendas", tags=["Tiendas"])


def _get_repo() -> TiendaRepositorio:
    return TiendaRepositorioCassandra()


def _mapear(tienda: Tienda) -> TiendaResponse:
    return TiendaResponse(
        id=tienda.id,
        nombre=tienda.nombre,
        vendedor_id=tienda.vendedor_id,
        descripcion=tienda.descripcion,
        avatar_url=tienda.avatar_url,
        telefono=tienda.telefono,
        direccion=tienda.direccion,
    )


@router.get("/", response_model=list[TiendaResponse])
async def listar_tiendas():
    repo = _get_repo()
    tiendas = await repo.listar_todos()
    return [_mapear(t) for t in tiendas]


@router.get("/{tienda_id}", response_model=TiendaResponse)
async def obtener_tienda(tienda_id: str):
    repo = _get_repo()
    tienda = await repo.obtener_por_id(tienda_id)
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return _mapear(tienda)


@router.post("/", response_model=TiendaResponse, status_code=201)
async def crear_tienda(
    body: TiendaRequest,
    usuario: dict = Depends(require_rol("superadmin", "admin")),
):
    repo = _get_repo()
    tienda = Tienda(
        id=str(uuid4()),
        nombre=body.nombre,
        vendedor_id=body.vendedor_id,
        descripcion=body.descripcion,
        avatar_url=body.avatar_url,
        telefono=body.telefono,
        direccion=body.direccion,
    )
    await repo.guardar(tienda)
    return _mapear(tienda)


@router.put("/{tienda_id}", response_model=TiendaResponse)
async def actualizar_tienda(
    tienda_id: str,
    body: TiendaUpdateRequest,
    usuario: dict = Depends(require_rol("superadmin", "admin")),
):
    repo = _get_repo()
    tienda = await repo.obtener_por_id(tienda_id)
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")

    if body.nombre is not None:
        tienda.nombre = body.nombre
    if body.vendedor_id is not None:
        tienda.vendedor_id = body.vendedor_id
    if body.descripcion is not None:
        tienda.descripcion = body.descripcion
    if body.avatar_url is not None:
        tienda.avatar_url = body.avatar_url
    if body.telefono is not None:
        tienda.telefono = body.telefono
    if body.direccion is not None:
        tienda.direccion = body.direccion

    await repo.guardar(tienda)
    return _mapear(tienda)


@router.delete("/{tienda_id}", status_code=204)
async def eliminar_tienda(
    tienda_id: str,
    usuario: dict = Depends(require_rol("superadmin")),
):
    repo = _get_repo()
    tienda = await repo.obtener_por_id(tienda_id)
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    await repo.eliminar(tienda_id)


@router.get("/deleted/all", response_model=list[TiendaResponse])
async def listar_tiendas_eliminadas(
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repo = _get_repo()
    tiendas = await repo.listar_eliminados()
    return [_mapear(t) for t in tiendas]


@router.post("/{tienda_id}/restore", response_model=TiendaResponse)
async def restaurar_tienda(
    tienda_id: str,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repo = _get_repo()
    await repo.restaurar(tienda_id)
    tienda = await repo.obtener_por_id(tienda_id)
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return _mapear(tienda)


@router.get("/mi-tienda/mia", response_model=TiendaResponse)
async def mi_tienda(usuario: dict = Depends(get_usuario_actual)):
    if not usuario.get("tienda_id"):
        raise HTTPException(status_code=404, detail="No tienes una tienda asignada")
    repo = _get_repo()
    tienda = await repo.obtener_por_id(usuario["tienda_id"])
    if not tienda:
        raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return _mapear(tienda)
