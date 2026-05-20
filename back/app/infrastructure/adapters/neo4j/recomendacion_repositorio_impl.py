import os
from typing import Any, Optional

from ....application.ports.recomendacion_repositorio import RecomendacionRepositorio
from ....domain.entities.recomendacion import RecomendacionCliente
from ...config.database import DBConfig


class RecomendacionRepositorioNeo4j(RecomendacionRepositorio):
    def __init__(self):
        self._driver = DBConfig.get_neo4j_driver()

    async def sincronizar_usuario(
        self,
        usuario_id: str,
        nombre: Optional[str] = None,
        email: Optional[str] = None,
        rol: Optional[str] = None,
    ) -> None:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            await session.run(
                """
                MERGE (u:Usuario {id: $usuario_id})
                ON CREATE SET
                    u.nombre = $nombre,
                    u.email = $email,
                    u.rol = $rol,
                    u.created_at = timestamp()
                ON MATCH SET
                    u.nombre = COALESCE($nombre, u.nombre),
                    u.email = COALESCE($email, u.email),
                    u.rol = COALESCE($rol, u.rol),
                    u.last_login = timestamp()
                """,
                usuario_id=usuario_id,
                nombre=nombre,
                email=email,
                rol=rol,
            )

    async def registrar_visita(
        self,
        usuario_id: str,
        producto_id: str,
        categoria_id: Optional[str] = None,
        vendedor_id: Optional[str] = None,
        nombre: Optional[str] = None,
        precio: Optional[float] = None,
        image_url: Optional[str] = None,
    ) -> None:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            await session.run(
                """
                MERGE (u:Usuario {id: $usuario_id})
                MERGE (p:Producto {id: $producto_id})
                ON CREATE SET
                    p.categoria_id = $categoria_id,
                    p.vendedor_id = $vendedor_id,
                    p.nombre = $nombre,
                    p.precio = $precio,
                    p.image_url = $image_url
                ON MATCH SET
                    p.categoria_id = COALESCE($categoria_id, p.categoria_id),
                    p.vendedor_id = COALESCE($vendedor_id, p.vendedor_id),
                    p.nombre = COALESCE($nombre, p.nombre),
                    p.precio = COALESCE($precio, p.precio),
                    p.image_url = COALESCE($image_url, p.image_url)
                WITH u, p
                OPTIONAL MATCH (u)-[r:VISITO]->(p)
                FOREACH (ignore IN CASE WHEN r IS NULL THEN [1] ELSE [] END |
                    CREATE (u)-[:VISITO {count: 1, first_visited: timestamp()}]->(p)
                )
                FOREACH (ignore IN CASE WHEN r IS NOT NULL THEN [1] ELSE [] END |
                    SET r.count = coalesce(r.count, 0) + 1,
                        r.last_visited = timestamp()
                )
                """,
                usuario_id=usuario_id,
                producto_id=producto_id,
                categoria_id=categoria_id,
                vendedor_id=vendedor_id,
                nombre=nombre,
                precio=precio,
                image_url=image_url,
            )

    async def registrar_compra(
        self,
        usuario_id: str,
        producto_id: str,
        categoria_id: Optional[str] = None,
        vendedor_id: Optional[str] = None,
        nombre: Optional[str] = None,
        precio: Optional[float] = None,
        image_url: Optional[str] = None,
    ) -> None:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            await session.run(
                """
                MERGE (u:Usuario {id: $usuario_id})
                MERGE (p:Producto {id: $producto_id})
                ON CREATE SET
                    p.categoria_id = $categoria_id,
                    p.vendedor_id = $vendedor_id,
                    p.nombre = $nombre,
                    p.precio = $precio,
                    p.image_url = $image_url
                ON MATCH SET
                    p.categoria_id = COALESCE($categoria_id, p.categoria_id),
                    p.vendedor_id = COALESCE($vendedor_id, p.vendedor_id),
                    p.nombre = COALESCE($nombre, p.nombre),
                    p.precio = COALESCE($precio, p.precio),
                    p.image_url = COALESCE($image_url, p.image_url)
                WITH u, p
                OPTIONAL MATCH (u)-[r:COMPRO]->(p)
                FOREACH (ignore IN CASE WHEN r IS NULL THEN [1] ELSE [] END |
                    CREATE (u)-[:COMPRO {count: 1, first_purchased: timestamp()}]->(p)
                )
                FOREACH (ignore IN CASE WHEN r IS NOT NULL THEN [1] ELSE [] END |
                    SET r.count = coalesce(r.count, 0) + 1,
                        r.last_purchased = timestamp()
                )
                """,
                usuario_id=usuario_id,
                producto_id=producto_id,
                categoria_id=categoria_id,
                vendedor_id=vendedor_id,
                nombre=nombre,
                precio=precio,
                image_url=image_url,
            )

    async def recomendar_productos(
        self, usuario_id: str, limite: int = 10
    ) -> list[dict[str, Any]]:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            result = await session.run(
                """
                MATCH (u:Usuario {id: $usuario_id})

                OPTIONAL MATCH (u)-[:VISITO|COMPRO]->(pref:Producto)
                WHERE pref.categoria_id IS NOT NULL
                WITH u, COLLECT(DISTINCT pref.categoria_id) AS cat_ids
                WITH u, cat_ids, SIZE(cat_ids) AS cat_count

                MATCH (cand:Producto)
                WHERE NOT EXISTS((u)-[:VISITO]->(cand))
                  AND NOT EXISTS((u)-[:COMPRO]->(cand))

                WITH u, cand, cat_ids, cat_count
                OPTIONAL MATCH (u)-[:VISITO|COMPRO]->(vp:Producto)<-[:VISITO|COMPRO]-(sim:Usuario)
                WHERE sim.id <> u.id AND EXISTS((sim)-[:VISITO|COMPRO]->(cand))
                WITH u, cand, cat_ids, cat_count, COUNT(DISTINCT sim) AS cf_score

                OPTIONAL MATCH (u)-[:COMPRO]->(b:Producto)<-[:COMPRO]-(other:Usuario)
                WHERE other.id <> u.id AND EXISTS((other)-[:COMPRO]->(cand))
                WITH u, cand, cat_ids, cat_count, cf_score, COUNT(DISTINCT other) AS xs_score

                OPTIONAL MATCH (u)-[:VISITO|COMPRO]->(catProd:Producto)
                WHERE catProd.categoria_id = cand.categoria_id AND cand.categoria_id IS NOT NULL
                WITH cand, cat_ids, cat_count, cf_score, xs_score, COUNT(DISTINCT catProd) AS cat_score

                OPTIONAL MATCH (cand)<-[r:VISITO|COMPRO]-()
                WITH cand, cf_score, xs_score, cat_score, COUNT(r) AS pop_score

                WITH cand,
                     CASE
                         WHEN cat_count = 0 THEN pop_score
                         ELSE coalesce(cf_score, 0) * 3
                              + coalesce(xs_score, 0) * 5
                              + coalesce(cat_score, 0) * 2
                              + coalesce(pop_score, 0) * 0.5
                     END AS total_score
                WHERE total_score > 0

                RETURN cand.id AS producto_id,
                       cand.nombre AS nombre,
                       cand.precio AS precio,
                       cand.categoria_id AS categoria_id,
                       cand.vendedor_id AS vendedor_id,
                       cand.image_url AS image_url,
                       round(total_score, 1) AS score
                ORDER BY total_score DESC
                LIMIT $limite
                """,
                usuario_id=usuario_id,
                limite=limite,
            )
            return await result.data()

    async def sincronizar_producto(
        self,
        producto_id: str,
        categoria_id: Optional[str] = None,
        vendedor_id: Optional[str] = None,
        nombre: Optional[str] = None,
        precio: Optional[float] = None,
        image_url: Optional[str] = None,
    ) -> None:
        db_name = os.getenv("NEO4J_DATABASE", "neo4j")
        async with self._driver.session(database=db_name) as session:
            await session.run(
                """
                MERGE (p:Producto {id: $producto_id})
                SET p.categoria_id = COALESCE(p.categoria_id, $categoria_id),
                    p.vendedor_id = COALESCE(p.vendedor_id, $vendedor_id),
                    p.nombre = COALESCE(p.nombre, $nombre),
                    p.precio = COALESCE(p.precio, $precio),
                    p.image_url = COALESCE(p.image_url, $image_url)
                """,
                producto_id=producto_id,
                categoria_id=categoria_id,
                vendedor_id=vendedor_id,
                nombre=nombre,
                precio=precio,
                image_url=image_url,
            )

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
                               THEN 'Cliente cercano con ' + toString(productos_compartidos) + ' producto(s) en com\u00fan'
                           ELSE 'Cliente cercano geogr\u00e1ficamente'
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
