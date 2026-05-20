from dataclasses import dataclass


@dataclass
class Categoria:
    id: str
    nombre: str
    descripcion: str = ""
