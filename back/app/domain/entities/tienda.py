from dataclasses import dataclass


@dataclass
class Tienda:
    id: str
    nombre: str
    vendedor_id: str
    descripcion: str = ""
    avatar_url: str = ""
    telefono: str = ""
    direccion: str = ""
    activo: bool = True
