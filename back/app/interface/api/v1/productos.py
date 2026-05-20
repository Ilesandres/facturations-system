from fastapi import APIRouter
from ...schemas.producto_schema import ProductoRequest, ProductoResponse
from ....application.use_cases.crear_producto import CrearProductoCasoUso
from ....application.ports.producto_repositorio import ProductoRepositorio
from ....infrastructure.adapters.mongodb.producto_repositorio_impl import (
    ProductoRepositorioMongo,
)

router = APIRouter(prefix="/productos", tags=["Productos"])


def _get_repositorio() -> ProductoRepositorio:
    return ProductoRepositorioMongo()


@router.post("/", response_model=ProductoResponse)
async def crear_producto(body: ProductoRequest):
    caso_uso = CrearProductoCasoUso(_get_repositorio())
    producto = await caso_uso.ejecutar(
        nombre=body.nombre,
        descripcion=body.descripcion,
        precio=body.precio,
        stock=body.stock,
        categoria=body.categoria,
        moneda=body.moneda,
    )
    return ProductoResponse(
        id=producto.id,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio.monto,
        moneda=producto.precio.moneda,
        stock=producto.stock,
        categoria=producto.categoria,
    )


@router.get("/", response_model=list[ProductoResponse])
async def listar_productos(categoria: str | None = None):
    repositorio = _get_repositorio()
    if categoria:
        productos = await repositorio.buscar_por_categoria(categoria)
    else:
        productos = await repositorio.listar_todos()
    return [
        ProductoResponse(
            id=p.id,
            nombre=p.nombre,
            descripcion=p.descripcion,
            precio=p.precio.monto,
            moneda=p.precio.moneda,
            stock=p.stock,
            categoria=p.categoria,
        )
        for p in productos
    ]


@router.get("/{producto_id}", response_model=ProductoResponse)
async def obtener_producto(producto_id: str):
    repositorio = _get_repositorio()
    producto = await repositorio.obtener_por_id(producto_id)
    if not producto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return ProductoResponse(
        id=producto.id,
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio.monto,
        moneda=producto.precio.moneda,
        stock=producto.stock,
        categoria=producto.categoria,
    )


@router.delete("/{producto_id}", status_code=204)
async def eliminar_producto(producto_id: str):
    repositorio = _get_repositorio()
    await repositorio.eliminar(producto_id)
