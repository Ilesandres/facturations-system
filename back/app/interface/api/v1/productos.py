from fastapi import APIRouter, Depends
from ...schemas.producto_schema import ProductoRequest, ProductoUpdateRequest, ProductoResponse
from ....application.use_cases.crear_producto import CrearProductoCasoUso
from ....application.use_cases.actualizar_producto import ActualizarProductoCasoUso
from ....application.ports.producto_repositorio import ProductoRepositorio
from ....infrastructure.adapters.mongodb.producto_repositorio_impl import (
    ProductoRepositorioMongo,
)
from ....infrastructure.adapters.neo4j.recomendacion_repositorio_impl import (
    RecomendacionRepositorioNeo4j,
)
from .auth import get_usuario_actual, get_usuario_opcional, require_rol

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


# --- Admin routes (must come BEFORE /{producto_id}) ---

@router.get("/deleted/all", response_model=list[ProductoResponse])
async def listar_productos_eliminados(
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repositorio = _get_repositorio()
    productos = await repositorio.listar_eliminados()
    return [_mapear(p) for p in productos]


@router.post("/{producto_id}/restore", response_model=ProductoResponse)
async def restaurar_producto(
    producto_id: str,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repositorio = _get_repositorio()
    await repositorio.restaurar(producto_id)
    producto = await repositorio.obtener_por_id(producto_id)
    if not producto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _mapear(producto)


# --- Regular CRUD routes ---

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
            await neo4j.registrar_visita(
                usuario_id=usuario["id"],
                producto_id=producto_id,
                categoria_id=producto.categoria_id,
                vendedor_id=producto.vendedor_id,
                nombre=producto.nombre,
                precio=producto.precio.monto,
                image_url=producto.image_url,
            )
        except Exception:
            pass
    return _mapear(producto)


@router.put("/{producto_id}", response_model=ProductoResponse)
async def actualizar_producto(
    producto_id: str,
    body: ProductoUpdateRequest,
    usuario: dict = Depends(get_usuario_actual),
):
    if usuario["rol"] in ("superadmin", "admin"):
        vendedor_id = ""
    else:
        vendedor_id = usuario["id"]
    caso_uso = ActualizarProductoCasoUso(_get_repositorio())
    try:
        producto = await caso_uso.ejecutar(
            producto_id=producto_id,
            nombre=body.nombre,
            descripcion=body.descripcion,
            precio=body.precio,
            moneda=body.moneda,
            stock=body.stock,
            categoria_id=body.categoria_id,
            image_url=body.image_url,
            vendedor_id=vendedor_id,
        )
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
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
    if usuario["rol"] not in ("superadmin", "admin") and producto.vendedor_id and producto.vendedor_id != usuario["id"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este producto")
    await repositorio.eliminar(producto_id)
