from pydantic import BaseModel


class UbicacionSchema(BaseModel):
    latitud: float
    longitud: float
    direccion: str = ""
    ciudad: str = ""
    pais: str = ""


class PersonaRequest(BaseModel):
    nombre: str
    email: str
    telefono: str
    ubicacion: UbicacionSchema
    tipo: str = "cliente"


class PersonaResponse(BaseModel):
    id: str
    nombre: str
    email: str
    telefono: str
    ubicacion: UbicacionSchema
    tipo: str
