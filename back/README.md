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
| `CASSANDRA_*` | Conexión a Cassandra (usuarios, roles, tiendas, personas) |
| `MONGO_*` | Conexión a MongoDB (productos) |
| `MYSQL_*` | Conexión a MySQL (ventas) |
| `NEO4J_*` | Conexión a Neo4j (recomendaciones) |
| `API_PORT` | Puerto del servidor (default: `8000`) |

## Seed automático

Al iniciar, el servidor crea las tablas necesarias y población inicial:

1. **Roles** — 5 roles en tabla `roles` (`superadmin`, `admin`, `vendedor`, `cliente`, `visitante`)
2. **Usuarios** — 1 usuario por rol (ver credenciales en README raíz)
3. **Tiendas** — 1 tienda para el vendedor (`Tienda de Vendedor Ejemplo`)

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@email.com` | `superadmin123` | `superadmin` |
| `admin@email.com` | `admin123` | `admin` |
| `vendedor@email.com` | `vendedor123` | `vendedor` |
| `cliente@email.com` | `cliente123` | `cliente` |
| `visitante@email.com` | `visitante123` | `visitante` |

## Sistema de roles

- Los roles se definen en `domain/value_objects/rol.py` (enum) y `domain/entities/rol.py` (entidad persistida).
- Al registrarse solo se permiten `cliente` y `vendedor` (definido en `ROLES_REGISTRABLES`).
- Para proteger rutas se usa `require_rol("admin", "superadmin")` en los routers.
- El JWT incluye `sub` (user id), `email`, `rol` y `rol_id`.

## Arquitectura

```
back/
└── app/
    ├── domain/           # Entidades, value objects (reglas de negocio puras)
    │   ├── entities/     # Usuario, Persona, Producto, Venta, Rol, Tienda
    │   └── value_objects/ # Ubicacion, Dinero, Rol (enum)
    ├── application/      # Puertos (interfaces) y casos de uso
    │   └── ports/        # UsuarioRepositorio, RolRepositorio, TiendaRepositorio...
    ├── infrastructure/   # Adaptadores concretos para cada DB
    │   ├── cassandra/    # Repositorios: Usuario, Rol, Tienda, Persona
    │   ├── mongodb/      # ProductoRepositorioMongo
    │   ├── mysql/        # VentaRepositorioMySQL
    │   └── neo4j/        # RecomendacionRepositorioNeo4j
    └── interface/        # API REST (FastAPI routers) + Pydantic schemas
        ├── api/v1/       # auth, productos, ventas, tiendas, personas...
        └── schemas/      # Request/Response models
```
