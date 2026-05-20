from typing import Optional

from pydantic import BaseModel


class TiendaRequest(BaseModel):
    nombre: str
    vendedor_id: str
    descripcion: str = ""
    avatar_url: str = ""
    telefono: str = ""
    direccion: str = ""


class TiendaUpdateRequest(BaseModel):
    nombre: Optional[str] = None
    vendedor_id: Optional[str] = None
    descripcion: Optional[str] = None
    avatar_url: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class TiendaResponse(BaseModel):
    id: str
    nombre: str
    vendedor_id: str
    descripcion: str
    avatar_url: str
    telefono: str
    direccion: str
