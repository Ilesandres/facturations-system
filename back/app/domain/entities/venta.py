from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from ..value_objects.dinero import Dinero


@dataclass
class DetalleFactura:
    id: str
    producto_id: str
    nombre_producto: str
    cantidad: int
    precio_unitario: Dinero

    @property
    def subtotal(self) -> Dinero:
        total = float(self.precio_unitario.monto) * self.cantidad
        return Dinero(monto=total, moneda=self.precio_unitario.moneda)


@dataclass
class Venta:
    id: str
    persona_id: str
    fecha: datetime
    detalles: list[DetalleFactura] = field(default_factory=list)
    total: Dinero = field(default=None)

    def __post_init__(self):
        if self.total is None and self.detalles:
            self.calcular_total()

    def agregar_detalle(self, detalle: DetalleFactura) -> None:
        self.detalles.append(detalle)
        self.calcular_total()

    def calcular_total(self) -> None:
        suma = sum(d.subtotal.monto for d in self.detalles)
        moneda = self.detalles[0].precio_unitario.moneda if self.detalles else "COP"
        self.total = Dinero(monto=suma, moneda=moneda)
