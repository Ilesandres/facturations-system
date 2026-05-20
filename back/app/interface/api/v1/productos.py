from fastapi import APIRouter, Depends
from ...schemas.producto_schema import ProductoRequest, ProductoResponse
from ....application.use_cases.crear_producto import CrearProductoCasoUso
from ....application.ports.producto_repositorio import ProductoRepositorio
from ....infrastructure.adapters.mongodb.producto_repositorio_impl import (
    ProductoRepositorioMongo,
)
from ....infrastructure.adapters.neo4j.recomendacion_repositorio_impl import (
    RecomendacionRepositorioNeo4j,
)
from .auth import get_usuario_actual, get_usuario_opcional

router = APIRouter(prefix="/productos", tags=["Productos"])


def _get_repositorio() -> ProductoRepositorio:
    return ProductoRepositorioMongo()


def _mapear(producto) -> ProductoResponse:
    return ProductoResponse(
        id=producto.id,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio.monto,
        moneda=producto.precio.moneda,
        stock=producto.stock,
        categoria_id=producto.categoria_id,
        image_url=producto.image_url,
        vendedor_id=producto.vendedor_id,
    )


@router.post("/", response_model=ProductoResponse)
async def crear_producto(
    body: ProductoRequest,
    usuario: dict = Depends(get_usuario_actual),
):
    caso_uso = CrearProductoCasoUso(_get_repositorio())
    producto = await caso_uso.ejecutar(
        nombre=body.nombre,
        descripcion=body.descripcion,
        precio=body.precio,
        stock=body.stock,
        categoria_id=body.categoria_id,
        moneda=body.moneda,
        image_url=body.image_url,
        vendedor_id=usuario["id"],
    )
    return _mapear(producto)


@router.get("/", response_model=list[ProductoResponse])
async def listar_productos(
    categoria_id: str | None = None,
    vendedor_id: str | None = None,
    search: str | None = None,
):
    repositorio = _get_repositorio()
    if vendedor_id:
        productos = await repositorio.buscar_por_vendedor(vendedor_id)
    elif categoria_id:
        productos = await repositorio.buscar_por_categoria(categoria_id)
    else:
        productos = await repositorio.listar_todos()
    if search:
        productos = [p for p in productos if search.lower() in p.nombre.lower()]
    return [_mapear(p) for p in productos]


@router.get("/{producto_id}", response_model=ProductoResponse)
async def obtener_producto(
    producto_id: str,
    usuario: dict | None = Depends(get_usuario_opcional),
):
    repositorio = _get_repositorio()
    producto = await repositorio.obtener_por_id(producto_id)
    if not producto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if usuario:
        try:
            neo4j = RecomendacionRepositorioNeo4j()
            await neo4j.registrar_visita(usuario["id"], producto_id)
        except Exception:
            pass
    return _mapear(producto)


@router.delete("/{producto_id}", status_code=204)
async def eliminar_producto(
    producto_id: str,
    usuario: dict = Depends(get_usuario_actual),
):
    repositorio = _get_repositorio()
    producto = await repositorio.obtener_por_id(producto_id)
    if not producto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.vendedor_id and producto.vendedor_id != usuario["id"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este producto")
    await repositorio.eliminar(producto_id)
