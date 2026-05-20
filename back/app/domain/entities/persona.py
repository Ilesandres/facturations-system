from dataclasses import dataclass
from typing import Optional
from ..value_objects.ubicacion import Ubicacion


@dataclass
class Persona:
    id: str
    nombre: str
    email: str
    telefono: str
    ubicacion: Ubicacion
    tipo: str  # cliente | proveedor

    def actualizar_ubicacion(self, nueva_ubicacion: Ubicacion) -> None:
        self.ubicacion = nueva_ubicacion
