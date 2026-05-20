from enum import Enum


class Rol(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    VENDEDOR = "vendedor"
    CLIENTE = "cliente"
    VISITANTE = "visitante"


ROLES_REGISTRABLES = {Rol.CLIENTE, Rol.VENDEDOR}
