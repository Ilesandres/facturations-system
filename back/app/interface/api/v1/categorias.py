from fastapi import APIRouter, Query
from ...schemas.categoria_schema import CategoriaRequest, CategoriaResponse, PaginatedCategoriaResponse
from ....application.use_cases.crear_categoria import CrearCategoriaCasoUso
from ....application.ports.categoria_repositorio import CategoriaRepositorio
from ....infrastructure.adapters.mongodb.categoria_repositorio_impl import (
    CategoriaRepositorioMongo,
)

router = APIRouter(prefix="/categorias", tags=["Categorias"])


def _get_repositorio() -> CategoriaRepositorio:
    return CategoriaRepositorioMongo()


@router.post("/", response_model=CategoriaResponse, status_code=201)
async def crear_categoria(body: CategoriaRequest):
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


@router.get("/{categoria_id}", response_model=CategoriaResponse)
async def obtener_categoria(categoria_id: str):
    repo = _get_repositorio()
    categoria = await repo.obtener_por_id(categoria_id)
    if not categoria:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    return CategoriaResponse(id=categoria.id, nombre=categoria.nombre, descripcion=categoria.descripcion)


@router.delete("/{categoria_id}", status_code=204)
async def eliminar_categoria(categoria_id: str):
    repo = _get_repositorio()
    categoria = await repo.obtener_por_id(categoria_id)
    if not categoria:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    await repo.eliminar(categoria_id)
