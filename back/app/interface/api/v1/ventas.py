from fastapi import APIRouter, Depends
from ...schemas.venta_schema import VentaRequest, VentaResponse, DetalleFacturaResponse
from ....application.use_cases.registrar_venta import RegistrarVentaCasoUso
from ....application.ports.producto_repositorio import ProductoRepositorio
from ....application.ports.venta_repositorio import VentaRepositorio
from ....infrastructure.adapters.mongodb.producto_repositorio_impl import (
    ProductoRepositorioMongo,
)
from ....infrastructure.adapters.mysql.venta_repositorio_impl import (
    VentaRepositorioMySQL,
)
from ....infrastructure.adapters.neo4j.recomendacion_repositorio_impl import (
    RecomendacionRepositorioNeo4j,
)
from .auth import get_usuario_actual

router = APIRouter(prefix="/ventas", tags=["Ventas"])


def _get_venta_repositorio() -> VentaRepositorio:
    return VentaRepositorioMySQL()


def _get_producto_repositorio() -> ProductoRepositorio:
    return ProductoRepositorioMongo()


@router.post("/", response_model=VentaResponse)
async def registrar_venta(
    body: VentaRequest,
    usuario: dict = Depends(get_usuario_actual),
):
    caso_uso = RegistrarVentaCasoUso(
        _get_venta_repositorio(),
        _get_producto_repositorio(),
        RecomendacionRepositorioNeo4j(),
    )
    venta = await caso_uso.ejecutar(
        persona_id=body.persona_id,
        items=[item.model_dump() for item in body.items],
        usuario_id=usuario["id"],
    )
    return VentaResponse(
        id=venta.id,
        persona_id=venta.persona_id,
        fecha=venta.fecha,
        detalles=[
            DetalleFacturaResponse(
                id=d.id,
                producto_id=d.producto_id,
                nombre_producto=d.nombre_producto,
                cantidad=d.cantidad,
                precio_unitario=d.precio_unitario.monto,
                moneda=d.precio_unitario.moneda,
                subtotal=d.subtotal.monto,
            )
            for d in venta.detalles
        ],
        total=venta.total.monto if venta.total else 0.0,
        moneda=venta.total.moneda if venta.total else "COP",
    )


@router.get("/{venta_id}", response_model=VentaResponse)
async def obtener_venta(venta_id: str):
    repositorio = _get_venta_repositorio()
    venta = await repositorio.obtener_por_id(venta_id)
    if not venta:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return VentaResponse(
        id=venta.id,
        persona_id=venta.persona_id,
        fecha=venta.fecha,
        detalles=[
            DetalleFacturaResponse(
                id=d.id,
                producto_id=d.producto_id,
                nombre_producto=d.nombre_producto,
                cantidad=d.cantidad,
                precio_unitario=d.precio_unitario.monto,
                moneda=d.precio_unitario.moneda,
                subtotal=d.subtotal.monto,
            )
            for d in venta.detalles
        ],
        total=venta.total.monto if venta.total else 0.0,
        moneda=venta.total.moneda if venta.total else "COP",
    )
