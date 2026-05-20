from dataclasses import dataclass
from decimal import Decimal


@dataclass
class RecomendacionCliente:
    persona_id: str
    nombre: str
    email: str
    distancia_km: float
    motivo: str
