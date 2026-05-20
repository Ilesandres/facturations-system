from pydantic import BaseModel
from datetime import datetime


class ItemVentaRequest(BaseModel):
    producto_id: str
    cantidad: int


class DetalleFacturaResponse(BaseModel):
    id: str
    producto_id: str
    nombre_producto: str
    cantidad: int
    precio_unitario: float
    moneda: str
    subtotal: float


class VentaRequest(BaseModel):
    persona_id: str
    items: list[ItemVentaRequest]


class VentaResponse(BaseModel):
    id: str
    persona_id: str
    fecha: datetime
    detalles: list[DetalleFacturaResponse]
    total: float
    moneda: str
