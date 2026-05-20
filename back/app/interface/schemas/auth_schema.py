from pydantic import BaseModel, field_validator

from ...domain.value_objects.rol import Rol, ROLES_REGISTRABLES


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str
    telefono: str = ""
    rol: str = Rol.CLIENTE

    @field_validator("password")
    @classmethod
    def password_limit(cls, v: str) -> str:
        if len(v) > 64:
            raise ValueError("La contraseña no puede tener más de 64 caracteres")
        return v

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: str) -> str:
        if v not in ROLES_REGISTRABLES:
            raise ValueError(
                f"Rol '{v}' no permitido. Debe ser uno de: {', '.join(ROLES_REGISTRABLES)}"
            )
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: dict


class UsuarioResponse(BaseModel):
    id: str
    nombre: str
    email: str
    telefono: str
    rol: str
    avatar_url: str
    tienda_id: str
