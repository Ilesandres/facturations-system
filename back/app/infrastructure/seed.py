import asyncio
import hashlib

from passlib.context import CryptContext
from uuid import uuid4

from ..domain.entities.rol import Rol
from ..domain.entities.usuario import Usuario
from ..domain.value_objects.ubicacion import Ubicacion
from ..domain.value_objects.rol import Rol as RolEnum
from .config.database import DBConfig
from .adapters.cassandra.usuario_repositorio_impl import UsuarioRepositorioCassandra
from .adapters.cassandra.rol_repositorio_impl import RolRepositorioCassandra

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SEED_ROLES = [
    Rol(id="rol-superadmin", nombre=RolEnum.SUPERADMIN, descripcion="Acceso total al sistema"),
    Rol(id="rol-admin", nombre=RolEnum.ADMIN, descripcion="Administración del sistema"),
    Rol(id="rol-vendedor", nombre=RolEnum.VENDEDOR, descripcion="Gestión de productos y tienda"),
    Rol(id="rol-cliente", nombre=RolEnum.CLIENTE, descripcion="Compra y navegación"),
    Rol(id="rol-visitante", nombre=RolEnum.VISITANTE, descripcion="Solo navegación pública"),
]

SEED_USERS = [
    {
        "nombre": "Super Admin",
        "email": "superadmin@email.com",
        "password": "superadmin123",
        "rol": RolEnum.SUPERADMIN,
    },
    {
        "nombre": "Admin",
        "email": "admin@email.com",
        "password": "admin123",
        "rol": RolEnum.ADMIN,
    },
    {
        "nombre": "Vendedor Ejemplo",
        "email": "vendedor@email.com",
        "password": "vendedor123",
        "rol": RolEnum.VENDEDOR,
    },
    {
        "nombre": "Cliente Ejemplo",
        "email": "cliente@email.com",
        "password": "cliente123",
        "rol": RolEnum.CLIENTE,
    },
    {
        "nombre": "Visitante Ejemplo",
        "email": "visitante@email.com",
        "password": "visitante123",
        "rol": RolEnum.VISITANTE,
    },
]


async def seed_roles():
    repo = RolRepositorioCassandra()
    for rol in SEED_ROLES:
        existente = await repo.obtener_por_nombre(rol.nombre)
        if existente:
            print(f"  [SKIP] rol '{rol.nombre}' — ya existe")
            continue
        await repo.guardar(rol)
        print(f"  [OK] rol '{rol.nombre}' -> {rol.descripcion}")


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
    print("=== Seed de roles ===")
    try:
        DBConfig.get_cassandra_session()
        await seed_roles()
        print("=== Seed de usuarios por rol ===")
        await seed_usuarios()
        print("=== Seed completado ===")
    except Exception as e:
        print(f"  [ERROR] {e}")


if __name__ == "__main__":
    asyncio.run(ejecutar_seed())
