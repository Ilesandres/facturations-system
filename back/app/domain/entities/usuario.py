from dataclasses import dataclass
from ..value_objects.ubicacion import Ubicacion
from ..value_objects.rol import Rol


@dataclass
class Usuario:
    id: str
    nombre: str
    email: str
    telefono: str
    password_hash: str
    ubicacion: Ubicacion
    rol: str  # superadmin | admin | vendedor | cliente | visitante
    avatar_url: str = ""
    tienda_id: str = ""

    def __post_init__(self):
        if isinstance(self.rol, Rol):
            self.rol = self.rol.value

    def es_vendedor(self) -> bool:
        return self.rol == Rol.VENDEDOR

    def es_admin(self) -> bool:
        return self.rol in (Rol.ADMIN, Rol.SUPERADMIN)

    def es_cliente(self) -> bool:
        return self.rol == Rol.CLIENTE
