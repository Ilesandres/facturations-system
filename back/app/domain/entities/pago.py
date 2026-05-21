from dataclasses import dataclass, field
from datetime import datetime
from ..value_objects.dinero import Dinero
from ..value_objects.estado import EstadoPago


@dataclass
class MetodoPago:
    id: str
    nombre: str
    descripcion: str = ""
    activo: bool = True


@dataclass
class Pago:
    id: str
    factura_id: str
    metodo_pago_id: str
    monto: Dinero
    estado: EstadoPago = EstadoPago.PENDIENTE
    referencia: str = ""
    fecha_pago: datetime | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
