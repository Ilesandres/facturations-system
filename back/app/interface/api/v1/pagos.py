from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from ....interface.schemas.pago_schema import (
    CheckoutRequest,
    FacturaResponse,
    DetalleFacturaResponse,
    PagoResponse,
    MetodoPagoResponse,
)
from ....application.use_cases.procesar_pago import ProcesarPagoCasoUso
from ....infrastructure.adapters.mysql.factura_repositorio_impl import FacturaRepositorioMySQL
from ....infrastructure.adapters.mysql.pago_repositorio_impl import PagoRepositorioMySQL, MetodoPagoRepositorioMySQL
from ....infrastructure.adapters.mongodb.producto_repositorio_impl import ProductoRepositorioMongo
from .auth import get_usuario_actual, require_rol

router = APIRouter(prefix="/pagos", tags=["Pagos"])


def _get_factura_repo() -> FacturaRepositorioMySQL:
    return FacturaRepositorioMySQL()


def _get_pago_repo() -> PagoRepositorioMySQL:
    return PagoRepositorioMySQL()


def _get_metodo_pago_repo() -> MetodoPagoRepositorioMySQL:
    return MetodoPagoRepositorioMySQL()


def _get_producto_repo() -> ProductoRepositorioMongo:
    return ProductoRepositorioMongo()


@router.post("/checkout", response_model=FacturaResponse)
async def checkout(
    body: CheckoutRequest,
    usuario: dict = Depends(get_usuario_actual),
):
    caso_uso = ProcesarPagoCasoUso(
        factura_repo=_get_factura_repo(),
        pago_repo=_get_pago_repo(),
        metodo_pago_repo=_get_metodo_pago_repo(),
        producto_repo=_get_producto_repo(),
    )
    try:
        factura = await caso_uso.ejecutar(
            persona_id=body.persona_id,
            usuario_id=usuario["id"],
            items=[{"producto_id": i.producto_id, "cantidad": i.cantidad} for i in body.items],
            metodo_pago_id=body.metodo_pago_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    pago_repo = _get_pago_repo()
    pagos = await pago_repo.listar_por_factura(factura.id)

    return _factura_to_response(factura, pagos)


@router.get("/facturas", response_model=list[FacturaResponse])
async def listar_facturas(
    usuario: dict = Depends(get_usuario_actual),
):
    repo = _get_factura_repo()
    pago_repo = _get_pago_repo()
    facturas = await repo.listar_por_usuario(usuario["id"])
    result = []
    for f in facturas:
        pagos = await pago_repo.listar_por_factura(f.id)
        result.append(_factura_to_response(f, pagos))
    return result


@router.get("/facturas/{factura_id}", response_model=FacturaResponse)
async def obtener_factura(
    factura_id: str,
    usuario: dict = Depends(get_usuario_actual),
):
    repo = _get_factura_repo()
    pago_repo = _get_pago_repo()
    factura = await repo.obtener_por_id(factura_id)
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    if factura.usuario_id != usuario["id"] and usuario["rol"] not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="No tienes acceso a esta factura")
    pagos = await pago_repo.listar_por_factura(factura.id)
    return _factura_to_response(factura, pagos)


@router.get("/metodos", response_model=list[MetodoPagoResponse])
async def listar_metodos_pago():
    repo = _get_metodo_pago_repo()
    metodos = await repo.listar_todos()
    return [
        MetodoPagoResponse(id=m.id, nombre=m.nombre, descripcion=m.descripcion, activo=m.activo)
        for m in metodos
    ]


def _factura_to_response(factura, pagos) -> FacturaResponse:
    return FacturaResponse(
        id=factura.id,
        persona_id=factura.persona_id,
        usuario_id=factura.usuario_id,
        fecha=factura.fecha,
        subtotal=factura.subtotal.monto,
        impuesto=factura.impuesto.monto,
        total=factura.total.monto,
        moneda=factura.subtotal.moneda,
        estado=factura.estado.value,
        metodo_pago_id=factura.metodo_pago_id,
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
            for d in factura.detalles
        ],
        pagos=[
            PagoResponse(
                id=p.id,
                factura_id=p.factura_id,
                metodo_pago_id=p.metodo_pago_id,
                monto=p.monto.monto,
                moneda=p.monto.moneda,
                estado=p.estado.value,
                referencia=p.referencia,
                fecha_pago=p.fecha_pago,
            )
            for p in pagos
        ],
    )
