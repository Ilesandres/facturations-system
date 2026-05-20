from typing import Any, Optional

from pydantic import BaseModel


class RecomendacionProductoResponse(BaseModel):
    producto_id: str
    nombre: Optional[str] = None
    precio: Optional[float] = None
    categoria_id: Optional[str] = None
    vendedor_id: Optional[str] = None
    image_url: Optional[str] = None
    score: float = 0.0


class RecomendacionResponse(BaseModel):
    persona_id: str
    nombre: str
    email: str
    distancia_km: float
    motivo: str
