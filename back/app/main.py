import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .interface.api.v1 import personas, productos, ventas, recomendaciones, auth, categorias, tiendas, admin, pagos
from .infrastructure.config.database import validar_config

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(
    title="MiniSistema de Ventas - Multi DB",
    description="""
    Sistema de facturación con arquitectura hexagonal que integra:
    - **Cassandra**: Personas (clientes/proveedores)
    - **MongoDB**: Productos
    - **MySQL**: Ventas y Detalle de Factura
    - **Neo4j**: Recomendación de clientes por cercanía geográfica
    """,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(personas.router, prefix="/api")
app.include_router(productos.router, prefix="/api")
app.include_router(ventas.router, prefix="/api")
app.include_router(recomendaciones.router, prefix="/api")
app.include_router(categorias.router, prefix="/api")
app.include_router(tiendas.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(pagos.router, prefix="/api")


FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "front" / "dist"
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="frontend-assets")

    @app.exception_handler(404)
    async def spa_fallback(request, exc):
        if not request.url.path.startswith("/api"):
            return FileResponse(str(FRONTEND_DIR / "index.html"))
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Not Found"}, status_code=404)


@app.on_event("startup")
async def verificar_conexiones():
    from .infrastructure.config.database import DBConfig

    errores = validar_config()
    if errores:
        for db, msg in errores.items():
            print(f"  [WARN] {db}: {msg}")

    print("\n--- Verificando conexiones a bases de datos ---")

    try:
        client = DBConfig.get_mongo_db()
        await client.command("ping")
        print("  [OK] MongoDB")
    except Exception as e:
        print(f"  [ERROR] MongoDB: {e}")

    try:
        pool = await DBConfig.get_mysql_pool()
        pool.close()
        await pool.wait_closed()
        print("  [OK] MySQL")
    except Exception as e:
        print(f"  [ERROR] MySQL: {e}")

    try:
        driver = DBConfig.get_neo4j_driver()
        async with driver.session() as session:
            await session.run("RETURN 1")
        await driver.close()
        print("  [OK] Neo4j")
    except Exception as e:
        print(f"  [ERROR] Neo4j: {e}")

    try:
        session = DBConfig.get_cassandra_session()
        session.execute("SELECT release_version FROM system.local")
        print("  [OK] Cassandra")
        from .infrastructure.seed import ejecutar_seed
        await ejecutar_seed()
    except Exception as e:
        print(f"  [ERROR] Cassandra: {e}")

    print("---------------------------------------------\n")


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/health/connections")
async def health_connections():
    from .infrastructure.config.database import DBConfig

    estado = {}

    try:
        client = DBConfig.get_mongo_db()
        await client.command("ping")
        estado["mongodb"] = "ok"
    except Exception as e:
        estado["mongodb"] = str(e)

    try:
        pool = await DBConfig.get_mysql_pool()
        pool.close()
        await pool.wait_closed()
        estado["mysql"] = "ok"
    except Exception as e:
        estado["mysql"] = str(e)

    try:
        driver = DBConfig.get_neo4j_driver()
        async with driver.session() as session:
            await session.run("RETURN 1")
        await driver.close()
        estado["neo4j"] = "ok"
    except Exception as e:
        estado["neo4j"] = str(e)

    try:
        session = DBConfig.get_cassandra_session()
        session.execute("SELECT release_version FROM system.local")
        estado["cassandra"] = "ok"
    except Exception as e:
        estado["cassandra"] = str(e)

    return estado


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("API_PORT", "8000")),
    )
