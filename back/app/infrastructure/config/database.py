import os
import sys
import warnings
from pathlib import Path

_REQUIRED_VARS = {
    "cassandra": ["CASSANDRA_HOST", "CASSANDRA_PORT", "CASSANDRA_KEYSPACE"],
    "mongodb": ["MONGO_URI", "MONGO_DB"],
    "mysql": ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"],
    "neo4j": ["NEO4J_URI", "NEO4J_USER", "NEO4J_PASSWORD"],
}


def _env_loaded() -> bool:
    return bool(os.getenv("API_PORT"))


def _check_dotenv():
    if _env_loaded():
        return
    env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
    if env_path.exists():
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=env_path)
    if not _env_loaded():
        print(
            "ERROR: No se encontró el archivo .env o las variables de entorno no están cargadas.",
            file=sys.stderr,
        )
        print("       Crea un archivo .env en la raíz del proyecto back/ basado en .env.example", file=sys.stderr)
        sys.exit(1)


_check_dotenv()

import gevent.monkey
os.environ.setdefault("CASSANDRA_DRIVER_NO_CYTHON", "1")
warnings.filterwarnings("ignore", category=gevent.monkey.MonkeyPatchWarning)
gevent.monkey.patch_all(thread=False, ssl=False)
from cassandra.cluster import Cluster, NoHostAvailable
from cassandra.auth import PlainTextAuthProvider

from motor.motor_asyncio import AsyncIOMotorClient
import aiomysql
from neo4j import AsyncGraphDatabase


def validar_config() -> dict[str, str]:
    errores = {}
    for db, vars in _REQUIRED_VARS.items():
        faltantes = [v for v in vars if not os.getenv(v)]
        if faltantes:
            errores[db] = f"Faltan variables: {', '.join(faltantes)}"
    return errores


class DBConfig:
    @staticmethod
    def get_cassandra_session():
        cluster = Cluster(
            [os.getenv("CASSANDRA_HOST", "localhost")],
            port=int(os.getenv("CASSANDRA_PORT", "9042")),
            auth_provider=(
                PlainTextAuthProvider(
                    os.getenv("CASSANDRA_USER", ""),
                    os.getenv("CASSANDRA_PASSWORD", ""),
                )
                if os.getenv("CASSANDRA_USER")
                else None
            ),
        )
        session = cluster.connect()
        keyspace = os.getenv("CASSANDRA_KEYSPACE", "personas_keyspace")
        session.execute(
            f"""
            CREATE KEYSPACE IF NOT EXISTS {keyspace}
            WITH replication = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
            """
        )
        session.set_keyspace(keyspace)
        session.execute(
            """
            CREATE TABLE IF NOT EXISTS personas (
                id text PRIMARY KEY,
                nombre text,
                email text,
                telefono text,
                latitud double,
                longitud double,
                direccion text,
                ciudad text,
                pais text,
                tipo text
            )
            """
        )
        return session

    @staticmethod
    def get_mongo_db():
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        user = os.getenv("MONGO_USER")
        password = os.getenv("MONGO_PASSWORD")
        if user and password:
            from urllib.parse import quote_plus
            uri = uri.replace("://", f"://{quote_plus(user)}:{quote_plus(password)}@")
        client = AsyncIOMotorClient(uri)
        return client[os.getenv("MONGO_DB", "productos_db")]

    @staticmethod
    async def get_mysql_pool():
        pool = await aiomysql.create_pool(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", "example"),
            db=os.getenv("MYSQL_DATABASE", "ventas_db"),
            autocommit=True,
        )
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS ventas (
                        id VARCHAR(36) PRIMARY KEY,
                        persona_id VARCHAR(36) NOT NULL,
                        fecha DATETIME NOT NULL,
                        total DECIMAL(12,2) NOT NULL,
                        moneda VARCHAR(3) DEFAULT 'COP'
                    )
                    """
                )
                await cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS detalle_factura (
                        id VARCHAR(36) PRIMARY KEY,
                        venta_id VARCHAR(36) NOT NULL,
                        producto_id VARCHAR(36) NOT NULL,
                        nombre_producto VARCHAR(255) NOT NULL,
                        cantidad INT NOT NULL,
                        precio_unitario DECIMAL(12,2) NOT NULL,
                        moneda VARCHAR(3) DEFAULT 'COP',
                        FOREIGN KEY (venta_id) REFERENCES ventas(id)
                    )
                    """
                )
        return pool

    @staticmethod
    def get_neo4j_driver():
        return AsyncGraphDatabase.driver(
            os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            auth=(
                os.getenv("NEO4J_USER", "neo4j"),
                os.getenv("NEO4J_PASSWORD", "admin"),
            ),
        )
