from pydantic import BaseModel


class TiendaResponse(BaseModel):
    id: str
    nombre: str
    vendedor_id: str
    descripcion: str
    avatar_url: str
    telefono: str
    direccion: str
