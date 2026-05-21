from datetime import datetime
from pydantic import BaseModel, field_validator


class ItemCheckoutRequest(BaseModel):
    producto_id: str
    cantidad: int

    @field_validator("cantidad")
    @classmethod
    def cantidad_positiva(cls, v):
        if v < 1:
            raise ValueError("La cantidad debe ser mayor a 0")
        return v


class CheckoutRequest(BaseModel):
    persona_id: str
    metodo_pago_id: str
    items: list[ItemCheckoutRequest]


class DetalleFacturaResponse(BaseModel):
    id: str
    producto_id: str
    nombre_producto: str
    cantidad: int
    precio_unitario: float
    moneda: str
    subtotal: float


class PagoResponse(BaseModel):
    id: str
    factura_id: str
    metodo_pago_id: str
    monto: float
    moneda: str
    estado: str
    referencia: str
    fecha_pago: datetime | None = None


class FacturaResponse(BaseModel):
    id: str
    persona_id: str
    usuario_id: str
    fecha: datetime
    subtotal: float
    impuesto: float
    total: float
    moneda: str
    estado: str
    metodo_pago_id: str
    detalles: list[DetalleFacturaResponse] = []
    pagos: list[PagoResponse] = []


class MetodoPagoResponse(BaseModel):
    id: str
    nombre: str
    descripcion: str
    activo: bool
