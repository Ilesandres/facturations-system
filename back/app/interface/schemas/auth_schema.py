from pydantic import BaseModel


class RegisterRequest(BaseModel):
    nombre: str
    email: str
    password: str
    telefono: str = ""
    tipo: str = "cliente"


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
