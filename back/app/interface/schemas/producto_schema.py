from pydantic import BaseModel


class ProductoRequest(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    moneda: str = "COP"
    stock: int
    categoria_id: str
    image_url: str = ""


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
