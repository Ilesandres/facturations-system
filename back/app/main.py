import os
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .interface.api.v1 import personas, productos, ventas, recomendaciones, auth

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

app.include_router(auth.router)
app.include_router(personas.router)
app.include_router(productos.router)
app.include_router(ventas.router)
app.include_router(recomendaciones.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("API_PORT", "8000")),
    )
