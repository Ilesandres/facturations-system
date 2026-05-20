import os

from ....application.ports.recomendacion_repositorio import RecomendacionRepositorio
from ....domain.entities.recomendacion import RecomendacionCliente
from ...config.database import DBConfig


class RecomendacionRepositorioNeo4j(RecomendacionRepositorio):
    def __init__(self):
        self._driver = DBConfig.get_neo4j_driver()

    async def registrar_visita(self, usuario_id: str, producto_id: str) -> None:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            await session.run(
                """
                MERGE (u:Usuario {id: $usuario_id})
                MERGE (p:Producto {id: $producto_id})
                MERGE (u)-[:VISITO]->(p)
                """,
                usuario_id=usuario_id,
                producto_id=producto_id,
            )

    async def registrar_compra(self, usuario_id: str, producto_id: str) -> None:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            await session.run(
                """
                MERGE (u:Usuario {id: $usuario_id})
                MERGE (p:Producto {id: $producto_id})
                MERGE (u)-[:COMPRO]->(p)
                """,
                usuario_id=usuario_id,
                producto_id=producto_id,
            )

    async def recomendar_productos(
        self, usuario_id: str, limite: int = 10
    ) -> list[dict]:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            result = await session.run(
                """
                MATCH (u:Usuario {id: $usuario_id})
                // Productos que usuarios similares (misma categoría visitada) han visitado
                MATCH (u)-[:VISITO]->(cat:Producto)<-[:VISITO]-(otro:Usuario)
                WHERE otro.id <> u.id
                MATCH (otro)-[:VISITO]->(rec:Producto)
                WHERE NOT EXISTS((u)-[:VISITO]->(rec))
                  AND NOT EXISTS((u)-[:COMPRO]->(rec))
                WITH rec, COUNT(DISTINCT otro) AS score
                ORDER BY score DESC
                LIMIT $limite
                RETURN rec.id AS producto_id, score
                """,
                usuario_id=usuario_id,
                limite=limite,
            )
            return await result.data()

    async def recomendar_por_cercania(
        self, persona_id: str, radio_km: float = 5.0, limite: int = 5
    ) -> list[RecomendacionCliente]:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            result = await session.run(
                """
                MATCH (p:Persona {id: $persona_id})
                MATCH (otra:Persona)
                WHERE otra.id <> p.id
                  AND point.distance(p.ubicacion, otra.ubicacion) <= $radio_metros
                OPTIONAL MATCH (otra)-[:COMPRO]->(prod:Producto)<-[:COMPRO]-(p)
                WITH otra,
                     point.distance(p.ubicacion, otra.ubicacion) AS distancia,
                     COUNT(DISTINCT prod) AS productos_compartidos
                ORDER BY distancia ASC, productos_compartidos DESC
                LIMIT $limite
                RETURN otra.id AS persona_id,
                       otra.nombre AS nombre,
                       otra.email AS email,
                       distancia / 1000.0 AS distancia_km,
                       CASE
                           WHEN productos_compartidos > 0
                               THEN 'Cliente cercano con ' + toString(productos_compartidos) + ' producto(s) en común'
                           ELSE 'Cliente cercano geográficamente'
                       END AS motivo
                """,
                persona_id=persona_id,
                radio_metros=radio_km * 1000,
                limite=limite,
            )
            records = await result.data()
            return [
                RecomendacionCliente(
                    persona_id=record["persona_id"],
                    nombre=record["nombre"],
                    email=record["email"],
                    distancia_km=record["distancia_km"],
                    motivo=record["motivo"],
                )
                for record in records
            ]
