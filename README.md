# MiniSistema de Ventas - Multi Base de Datos

Sistema de facturación con **arquitectura hexagonal** que integra 4 bases de datos:

| Base de Datos | Propósito |
|---------------|-----------|
| **Cassandra** | Personas (clientes / proveedores) |
| **MongoDB** | Productos |
| **MySQL** | Ventas y Detalle de Factura |
| **Neo4j** | Recomendación de clientes por cercanía geográfica |

## Stack

- **Backend**: Python + FastAPI (async)
- **Frontend**: React 19 + Vite 6 + TypeScript
- **Arquitectura**: Hexagonal (dominio, aplicación, infraestructura, interfaz)

## Estructura

```
taller-multi-bd/
├── back/          # FastAPI + arquitectura hexagonal
│   ├── app/
│   │   ├── domain/           # Entidades y value objects
│   │   ├── application/      # Puertos y casos de uso
│   │   ├── infrastructure/   # Adaptadores para cada DB
│   │   └── interface/        # API REST (FastAPI routers)
│   └── .env                  # Configuración de bases de datos
├── front/         # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/              # Clientes HTTP por módulo
│   │   ├── components/       # Componentes CRUD
│   │   └── types/            # Interfaces TypeScript
│   └── .env                  # URL del backend
└── README.md
```

## Requisitos

- Python 3.12+
- Node.js 20+
- Las 4 bases de datos corriendo (Cassandra, MongoDB, MySQL, Neo4j)

## Inicio rápido

```bash
# Backend
cd back
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
python -m app.main

# Frontend (otra terminal)
cd front
npm install
npm run dev
```

Backend en `http://localhost:8000` — Frontend en `http://localhost:5173`

## API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/personas/` | Crear persona |
| GET | `/personas/` | Listar personas |
| GET | `/personas/{id}` | Obtener persona |
| DELETE | `/personas/{id}` | Eliminar persona |
| POST | `/productos/` | Crear producto |
| GET | `/productos/` | Listar productos |
| GET | `/productos/{id}` | Obtener producto |
| DELETE | `/productos/{id}` | Eliminar producto |
| POST | `/ventas/` | Registrar venta |
| GET | `/ventas/{id}` | Obtener factura |
| GET | `/recomendaciones/{persona_id}` | Recomendar clientes cercanos |
| GET | `/health` | Health check |

Documentación interactiva: `http://localhost:8000/docs`
