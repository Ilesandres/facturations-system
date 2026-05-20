import os

from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
from motor.motor_asyncio import AsyncIOMotorClient
import aiomysql
from neo4j import AsyncGraphDatabase


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
        client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
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
