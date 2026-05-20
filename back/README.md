# Backend — FastAPI + Arquitectura Hexagonal

## Iniciar

```bash
cd back
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

Servidor en `http://localhost:8000` — Docs: `http://localhost:8000/docs`

## Variables de entorno (`back/.env`)

| Variable | Descripción |
|----------|-------------|
| `CASSANDRA_*` | Conexión a Cassandra (personas) |
| `MONGO_*` | Conexión a MongoDB (productos) |
| `MYSQL_*` | Conexión a MySQL (ventas) |
| `NEO4J_*` | Conexión a Neo4j (recomendaciones) |
| `API_HOST` | Host del servidor (default: `0.0.0.0`) |
| `API_PORT` | Puerto del servidor (default: `8000`) |

## Arquitectura

```
back/
└── app/
    ├── domain/           # Entidades, value objects (reglas de negocio puras)
    ├── application/      # Puertos (interfaces) y casos de uso
    ├── infrastructure/   # Adaptadores concretos para cada DB
    │   ├── cassandra/    # PersonaRepositorioCassandra
    │   ├── mongodb/      # ProductoRepositorioMongo
    │   ├── mysql/        # VentaRepositorioMySQL
    │   └── neo4j/        # RecomendacionRepositorioNeo4j
    └── interface/        # API REST (FastAPI routers) + Pydantic schemas
```
