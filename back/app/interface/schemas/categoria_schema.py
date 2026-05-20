from pydantic import BaseModel


class CategoriaRequest(BaseModel):
    nombre: str
    descripcion: str = ""


class CategoriaResponse(BaseModel):
    id: str
    nombre: str
    descripcion: str


class PaginatedCategoriaResponse(BaseModel):
    items: list[CategoriaResponse]
    total: int
    skip: int
    limit: int
