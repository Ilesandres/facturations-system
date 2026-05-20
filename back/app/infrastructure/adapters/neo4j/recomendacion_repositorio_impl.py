from ....application.ports.recomendacion_repositorio import RecomendacionRepositorio
from ....domain.entities.recomendacion import RecomendacionCliente
from ...config.database import DBConfig


class RecomendacionRepositorioNeo4j(RecomendacionRepositorio):
    def __init__(self):
        self._driver = DBConfig.get_neo4j_driver()

    async def recomendar_por_cercania(
        self, persona_id: str, radio_km: float = 5.0, limite: int = 5
    ) -> list[RecomendacionCliente]:
        async with self._driver.session(database="neo4j") as session:
            result = await session.run(
                """
                // Encontrar la persona de referencia
                MATCH (p:Persona {id: $persona_id})
                // Personas cercanas geográficamente usando punto espacial
                MATCH (otra:Persona)
                WHERE otra.id <> p.id
                  AND point.distance(p.ubicacion, otra.ubicacion) <= $radio_metros
                // Opcional: personas que han comprado productos similares
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
            records = await result.fetch()
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
