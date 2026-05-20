from fastapi import APIRouter, Depends

from ....infrastructure.adapters.cassandra.persona_repositorio_impl import (
    PersonaRepositorioCassandra,
)
from ....infrastructure.adapters.cassandra.tienda_repositorio_impl import (
    TiendaRepositorioCassandra,
)
from ....infrastructure.adapters.cassandra.usuario_repositorio_impl import (
    UsuarioRepositorioCassandra,
)
from ....infrastructure.adapters.mysql.venta_repositorio_impl import (
    VentaRepositorioMySQL,
)
from ....infrastructure.config.database import DBConfig
from .auth import require_rol

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def admin_stats(
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):

    stats = {}

    try:
        mongo = DBConfig.get_mongo_db()
        stats["productos_activos"] = await mongo["productos"].count_documents({"activo": {"$ne": False}})
        stats["productos_eliminados"] = await mongo["productos"].count_documents({"activo": False})
        stats["categorias_activas"] = await mongo["categorias"].count_documents({"activo": {"$ne": False}})
        stats["categorias_eliminadas"] = await mongo["categorias"].count_documents({"activo": False})
    except Exception as e:
        stats["mongo_error"] = str(e)

    try:
        usuario_repo = UsuarioRepositorioCassandra()
        usuarios = await usuario_repo.listar_todos()
        stats["usuarios_activos"] = len(usuarios)
    except Exception as e:
        stats["cassandra_usuario_error"] = str(e)

    try:
        tienda_repo = TiendaRepositorioCassandra()
        tiendas = await tienda_repo.listar_todos()
        tiendas_eliminadas = await tienda_repo.listar_eliminados()
        stats["tiendas_activas"] = len(tiendas)
        stats["tiendas_eliminadas"] = len(tiendas_eliminadas)
    except Exception as e:
        stats["cassandra_tienda_error"] = str(e)

    try:
        persona_repo = PersonaRepositorioCassandra()
        personas = await persona_repo.listar_todos()
        stats["personas_activas"] = len(personas)
    except Exception as e:
        stats["cassandra_persona_error"] = str(e)

    try:
        venta_repo = VentaRepositorioMySQL()
        ventas = await venta_repo.listar_todos()
        stats["ventas"] = len(ventas)
    except Exception as e:
        stats["mysql_error"] = str(e)

    stats["total_global"] = sum(v for k, v in stats.items() if isinstance(v, int))
    return stats


@router.post("/sync-neo4j")
async def sync_neo4j(
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    """Sync all active products from MongoDB to Neo4j."""
    from ....infrastructure.adapters.mongodb.producto_repositorio_impl import ProductoRepositorioMongo
    from ....infrastructure.adapters.neo4j.recomendacion_repositorio_impl import RecomendacionRepositorioNeo4j

    repo = ProductoRepositorioMongo()
    neo4j = RecomendacionRepositorioNeo4j()
    productos = await repo.listar_todos()
    synced = 0
    errors = 0
    for p in productos:
        try:
            await neo4j.sincronizar_producto(
                producto_id=p.id,
                nombre=p.nombre,
                precio=p.precio.monto,
                categoria_id=p.categoria_id,
                vendedor_id=p.vendedor_id,
                image_url=p.image_url,
            )
            synced += 1
        except Exception:
            errors += 1
    return {"synced": synced, "errors": errors, "total": len(productos)}
