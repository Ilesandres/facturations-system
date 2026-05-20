from typing import Optional

from pydantic import BaseModel


class ProductoRequest(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    moneda: str = "COP"
    stock: int
    categoria_id: str
    image_url: str = ""


class ProductoUpdateRequest(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    moneda: Optional[str] = None
    stock: Optional[int] = None
    categoria_id: Optional[str] = None
    image_url: Optional[str] = None


class ProductoResponse(BaseModel):
    id: str
    nombre: str
    descripcion: str
    precio: float
    moneda: str
    stock: int
    categoria_id: str
    image_url: str
    vendedor_id: str
