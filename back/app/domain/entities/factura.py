from dataclasses import dataclass, field
from datetime import datetime
from ..value_objects.dinero import Dinero
from ..value_objects.estado import EstadoFactura


@dataclass
class DetalleFactura:
    id: str
    factura_id: str
    producto_id: str
    nombre_producto: str
    cantidad: int
    precio_unitario: Dinero

    @property
    def subtotal(self) -> Dinero:
        total = float(self.precio_unitario.monto) * self.cantidad
        return Dinero(monto=total, moneda=self.precio_unitario.moneda)


@dataclass
class Factura:
    id: str
    persona_id: str
    usuario_id: str
    fecha: datetime
    subtotal: Dinero
    impuesto: Dinero
    total: Dinero
    estado: EstadoFactura = EstadoFactura.PENDIENTE
    metodo_pago_id: str = ""
    detalles: list[DetalleFactura] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
