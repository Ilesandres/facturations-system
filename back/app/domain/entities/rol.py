from dataclasses import dataclass

from ..value_objects.rol import Rol as RolEnum


@dataclass
class Rol:
    id: str
    nombre: str
    descripcion: str

    def __post_init__(self):
        if isinstance(self.nombre, RolEnum):
            self.nombre = self.nombre.value
