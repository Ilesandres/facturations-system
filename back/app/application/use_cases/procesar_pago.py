from datetime import datetime
from uuid import uuid4

from ...domain.entities.factura import Factura, DetalleFactura
from ...domain.entities.pago import Pago
from ...domain.value_objects.dinero import Dinero
from ...domain.value_objects.estado import EstadoFactura, EstadoPago
from ...application.ports.factura_repositorio import FacturaRepositorio
from ...application.ports.pago_repositorio import PagoRepositorio, MetodoPagoRepositorio
from ...application.ports.producto_repositorio import ProductoRepositorio
from ...infrastructure.adapters.neo4j.recomendacion_repositorio_impl import RecomendacionRepositorioNeo4j

IMPUESTO_PORCENTAJE = 0.19


class ProcesarPagoCasoUso:
    def __init__(
        self,
        factura_repo: FacturaRepositorio,
        pago_repo: PagoRepositorio,
        metodo_pago_repo: MetodoPagoRepositorio,
        producto_repo: ProductoRepositorio,
    ):
        self._factura_repo = factura_repo
        self._pago_repo = pago_repo
        self._metodo_pago_repo = metodo_pago_repo
        self._producto_repo = producto_repo

    async def ejecutar(
        self,
        persona_id: str,
        usuario_id: str,
        items: list[dict],
        metodo_pago_id: str,
    ) -> Factura:
        metodo = await self._metodo_pago_repo.obtener_por_id(metodo_pago_id)
        if not metodo:
            raise ValueError("Método de pago no válido")

        detalles: list[DetalleFactura] = []
        for item in items:
            producto = await self._producto_repo.obtener_por_id(item["producto_id"])
            if not producto:
                raise ValueError(f"Producto {item['producto_id']} no encontrado")
            if not producto.activo:
                raise ValueError(f"Producto {producto.nombre} no está disponible")
            producto.descontar_stock(item["cantidad"])
            await self._producto_repo.guardar(producto)

            detalle = DetalleFactura(
                id=str(uuid4()),
                factura_id="",
                producto_id=producto.id,
                nombre_producto=producto.nombre,
                cantidad=item["cantidad"],
                precio_unitario=producto.precio,
            )
            detalles.append(detalle)

        subtotal = sum(d.subtotal.monto for d in detalles)
        moneda = detalles[0].precio_unitario.moneda if detalles else "COP"
        subtotal_dinero = Dinero(monto=subtotal, moneda=moneda)
        impuesto_dinero = Dinero(monto=subtotal * IMPUESTO_PORCENTAJE, moneda=moneda)
        total_dinero = Dinero(monto=subtotal * (1 + IMPUESTO_PORCENTAJE), moneda=moneda)

        factura_id = str(uuid4())
        for d in detalles:
            d.factura_id = factura_id

        ahora = datetime.utcnow()
        factura = Factura(
            id=factura_id,
            persona_id=persona_id,
            usuario_id=usuario_id,
            fecha=ahora,
            subtotal=subtotal_dinero,
            impuesto=impuesto_dinero,
            total=total_dinero,
            estado=EstadoFactura.PENDIENTE,
            metodo_pago_id=metodo_pago_id,
            detalles=detalles,
        )
        await self._factura_repo.guardar(factura)

        pago_id = str(uuid4())
        pago = Pago(
            id=pago_id,
            factura_id=factura_id,
            metodo_pago_id=metodo_pago_id,
            monto=total_dinero,
            estado=EstadoPago.PROCESANDO,
        )
        await self._pago_repo.guardar(pago)

        pago.estado = EstadoPago.COMPLETADO
        pago.referencia = f"SIM-{uuid4().hex[:12].upper()}"
        pago.fecha_pago = datetime.utcnow()
        await self._pago_repo.guardar(pago)

        factura.estado = EstadoFactura.PAGADA
        await self._factura_repo.guardar(factura)

        try:
            neo4j = RecomendacionRepositorioNeo4j()
            for d in detalles:
                await neo4j.registrar_compra(
                    usuario_id=usuario_id,
                    producto_id=d.producto_id,
                )
        except Exception:
            pass

        return factura
