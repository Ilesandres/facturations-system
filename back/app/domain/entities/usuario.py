from dataclasses import dataclass
from ..value_objects.ubicacion import Ubicacion


@dataclass
class Usuario:
    id: str
    nombre: str
    email: str
    telefono: str
    password_hash: str
    ubicacion: Ubicacion
    tipo: str  # cliente | vendedor
    avatar_url: str = ""
    tienda_id: str = ""

    def es_vendedor(self) -> bool:
        return self.tipo == "vendedor"
