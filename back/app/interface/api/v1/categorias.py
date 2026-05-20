from fastapi import APIRouter, Depends, HTTPException, Query

from ...schemas.categoria_schema import (
    CategoriaRequest,
    CategoriaResponse,
    PaginatedCategoriaResponse,
)
from ....application.use_cases.crear_categoria import CrearCategoriaCasoUso
from ....application.ports.categoria_repositorio import CategoriaRepositorio
from ....infrastructure.adapters.mongodb.categoria_repositorio_impl import (
    CategoriaRepositorioMongo,
)
from .auth import require_rol

router = APIRouter(prefix="/categorias", tags=["Categorias"])


def _get_repositorio() -> CategoriaRepositorio:
    return CategoriaRepositorioMongo()


@router.post("/", response_model=CategoriaResponse, status_code=201)
async def crear_categoria(
    body: CategoriaRequest,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    caso_uso = CrearCategoriaCasoUso(_get_repositorio())
    categoria = await caso_uso.ejecutar(nombre=body.nombre, descripcion=body.descripcion)
    return CategoriaResponse(id=categoria.id, nombre=categoria.nombre, descripcion=categoria.descripcion)


@router.get("/", response_model=PaginatedCategoriaResponse)
async def listar_categorias(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    repo = _get_repositorio()
    items = await repo.listar_todos(skip=skip, limit=limit)
    total = await repo.contar()
    return PaginatedCategoriaResponse(
        items=[CategoriaResponse(id=c.id, nombre=c.nombre, descripcion=c.descripcion) for c in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/deleted/all", response_model=list[CategoriaResponse])
async def listar_categorias_eliminadas(
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repo = _get_repositorio()
    categorias = await repo.listar_eliminados()
    return [CategoriaResponse(id=c.id, nombre=c.nombre, descripcion=c.descripcion) for c in categorias]


@router.post("/{categoria_id}/restore", response_model=CategoriaResponse)
async def restaurar_categoria(
    categoria_id: str,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repo = _get_repositorio()
    await repo.restaurar(categoria_id)
    categoria = await repo.obtener_por_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    return CategoriaResponse(id=categoria.id, nombre=categoria.nombre, descripcion=categoria.descripcion)


@router.get("/{categoria_id}", response_model=CategoriaResponse)
async def obtener_categoria(categoria_id: str):
    repo = _get_repositorio()
    categoria = await repo.obtener_por_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    return CategoriaResponse(id=categoria.id, nombre=categoria.nombre, descripcion=categoria.descripcion)


@router.put("/{categoria_id}", response_model=CategoriaResponse)
async def actualizar_categoria(
    categoria_id: str,
    body: CategoriaRequest,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repo = _get_repositorio()
    categoria = await repo.obtener_por_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    categoria.nombre = body.nombre
    categoria.descripcion = body.descripcion
    await repo.guardar(categoria)
    return CategoriaResponse(id=categoria.id, nombre=categoria.nombre, descripcion=categoria.descripcion)


@router.delete("/{categoria_id}", status_code=204)
async def eliminar_categoria(
    categoria_id: str,
    usuario: dict = Depends(require_rol("superadmin")),
):
    repo = _get_repositorio()
    categoria = await repo.obtener_por_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    await repo.eliminar(categoria_id)
