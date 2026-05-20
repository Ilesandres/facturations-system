import asyncio
import hashlib

from passlib.context import CryptContext
from uuid import uuid4

from ..domain.entities.rol import Rol
from ..domain.entities.tienda import Tienda
from ..domain.entities.usuario import Usuario
from ..domain.value_objects.ubicacion import Ubicacion
from ..domain.value_objects.rol import Rol as RolEnum
from .config.database import DBConfig
from .adapters.cassandra.usuario_repositorio_impl import UsuarioRepositorioCassandra
from .adapters.cassandra.rol_repositorio_impl import RolRepositorioCassandra
from .adapters.cassandra.tienda_repositorio_impl import TiendaRepositorioCassandra

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
        "rol_id": "rol-superadmin",
    },
    {
        "nombre": "Admin",
        "email": "admin@email.com",
        "password": "admin123",
        "rol": RolEnum.ADMIN,
        "rol_id": "rol-admin",
    },
    {
        "nombre": "Vendedor Ejemplo",
        "email": "vendedor@email.com",
        "password": "vendedor123",
        "rol": RolEnum.VENDEDOR,
        "rol_id": "rol-vendedor",
    },
    {
        "nombre": "Cliente Ejemplo",
        "email": "cliente@email.com",
        "password": "cliente123",
        "rol": RolEnum.CLIENTE,
        "rol_id": "rol-cliente",
    },
    {
        "nombre": "Visitante Ejemplo",
        "email": "visitante@email.com",
        "password": "visitante123",
        "rol": RolEnum.VISITANTE,
        "rol_id": "rol-visitante",
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


SEED_TIENDAS = [
    {
        "id": "tienda-vendedor-1",
        "nombre": "Tienda de Vendedor Ejemplo",
        "vendedor_email": "vendedor@email.com",
        "descripcion": "Los mejores productos con los mejores precios",
        "avatar_url": "",
        "telefono": "3001234567",
        "direccion": "Calle 123, Ciudad",
    },
]


async def seed_tiendas(users_cache: dict[str, str]):
    repo = TiendaRepositorioCassandra()
    for td in SEED_TIENDAS:
        existente = await repo.obtener_por_id(td["id"])
        if existente:
            print(f"  [SKIP] tienda '{td['id']}' — ya existe")
            continue
        vendedor_id = users_cache.get(td["vendedor_email"])
        if not vendedor_id:
            print(f"  [SKIP] tienda '{td['id']}' — vendedor no encontrado")
            continue
        tienda = Tienda(
            id=td["id"],
            nombre=td["nombre"],
            vendedor_id=vendedor_id,
            descripcion=td["descripcion"],
            avatar_url=td["avatar_url"],
            telefono=td["telefono"],
            direccion=td["direccion"],
        )
        await repo.guardar(tienda)
        # Assign tienda_id to the vendedor user
        user_repo = UsuarioRepositorioCassandra()
        vendedor = await user_repo.obtener_por_id(vendedor_id)
        if vendedor:
            vendedor.tienda_id = td["id"]
            await user_repo.guardar(vendedor)
        print(f"  [OK] tienda '{td['nombre']}' -> vendedor={td['vendedor_email']}")


async def seed_usuarios():
    repo = UsuarioRepositorioCassandra()
    users_cache = {}

    for user_data in SEED_USERS:
        existente = await repo.obtener_por_email(user_data["email"])
        if existente:
            users_cache[user_data["email"]] = existente.id
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
            rol_id=user_data["rol_id"],
        )
        users_cache[user_data["email"]] = usuario.id
        await repo.guardar(usuario)
        print(f"  [OK] {user_data['email']} -> {user_data['rol'].value} (rol_id={user_data['rol_id']})")

    return users_cache


async def ejecutar_seed():
    print("=== Seed de roles ===")
    try:
        DBConfig.get_cassandra_session()
        await seed_roles()
        print("=== Seed de usuarios por rol ===")
        users_cache = await seed_usuarios()
        print("=== Seed de tiendas ===")
        await seed_tiendas(users_cache)
        print("=== Seed completado ===")
    except Exception as e:
        print(f"  [ERROR] {e}")


if __name__ == "__main__":
    asyncio.run(ejecutar_seed())
