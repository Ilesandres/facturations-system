from pydantic import BaseModel, field_validator


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str
    telefono: str = ""
    tipo: str = "cliente"

    @field_validator("password")
    @classmethod
    def password_limit(cls, v: str) -> str:
        if len(v) > 64:
            raise ValueError("La contraseña no puede tener más de 64 caracteres")
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
    tipo: str
    avatar_url: str
    tienda_id: str
