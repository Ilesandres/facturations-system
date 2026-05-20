import asyncio
import hashlib

from passlib.context import CryptContext
from uuid import uuid4

from ..domain.entities.usuario import Usuario
from ..domain.value_objects.ubicacion import Ubicacion
from ..domain.value_objects.rol import Rol
from .config.database import DBConfig
from .adapters.cassandra.usuario_repositorio_impl import UsuarioRepositorioCassandra

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SEED_USERS = [
    {
        "nombre": "Super Admin",
        "email": "superadmin@email.com",
        "password": "superadmin123",
        "rol": Rol.SUPERADMIN,
    },
    {
        "nombre": "Admin",
        "email": "admin@email.com",
        "password": "admin123",
        "rol": Rol.ADMIN,
    },
    {
        "nombre": "Vendedor Ejemplo",
        "email": "vendedor@email.com",
        "password": "vendedor123",
        "rol": Rol.VENDEDOR,
    },
    {
        "nombre": "Cliente Ejemplo",
        "email": "cliente@email.com",
        "password": "cliente123",
        "rol": Rol.CLIENTE,
    },
    {
        "nombre": "Visitante Ejemplo",
        "email": "visitante@email.com",
        "password": "visitante123",
        "rol": Rol.VISITANTE,
    },
]


async def seed_usuarios():
    repo = UsuarioRepositorioCassandra()

    for user_data in SEED_USERS:
        existente = await repo.obtener_por_email(user_data["email"])
        if existente:
            print(f"  [SKIP] {user_data['email']} — ya existe")
            continue

        password_hash = await asyncio.to_thread(
            lambda: pwd_context.hash(hashlib.sha256(user_data["password"].encode()).hexdigest())
        )

        usuario = Usuario(
            id=str(uuid4()),
            nombre=user_data["nombre"],
            email=user_data["email"],
            telefono="",
            password_hash=password_hash,
            ubicacion=Ubicacion(latitud=0.0, longitud=0.0, direccion="", ciudad="", pais=""),
            rol=user_data["rol"],
        )
        await repo.guardar(usuario)
        print(f"  [OK] {user_data['email']} -> {user_data['rol'].value}")


async def ejecutar_seed():
    print("=== Seed de usuarios por rol ===")
    try:
        DBConfig.get_cassandra_session()
        await seed_usuarios()
        print("=== Seed completado ===")
    except Exception as e:
        print(f"  [ERROR] {e}")


if __name__ == "__main__":
    asyncio.run(ejecutar_seed())
