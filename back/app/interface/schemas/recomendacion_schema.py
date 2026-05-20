from pydantic import BaseModel


class RecomendacionResponse(BaseModel):
    persona_id: str
    nombre: str
    email: str
    distancia_km: float
    motivo: str
