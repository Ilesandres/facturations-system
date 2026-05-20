# MiniSistema de Ventas — Multi Base de Datos

Sistema de facturación con **arquitectura hexagonal** que integra 4 bases de datos:

| Base de Datos | Propósito |
|---------------|-----------|
| **Cassandra** | Usuarios, roles, personas (clientes/proveedores), tiendas |
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
├── back/                     # FastAPI + arquitectura hexagonal
│   ├── app/
│   │   ├── domain/           # Entidades y value objects
│   │   ├── application/      # Puertos y casos de uso
│   │   ├── infrastructure/   # Adaptadores para cada DB
│   │   └── interface/        # API REST (FastAPI routers + schemas)
│   └── .env                  # Configuración de bases de datos
├── front/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/              # Clientes HTTP por módulo
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── pages/            # Páginas por ruta
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

## Usuarios de prueba (seed automático)

Al iniciar el backend se crean automáticamente 5 usuarios, uno por cada rol:

| Email | Contraseña | Rol | Acceso |
|-------|-----------|-----|--------|
| `superadmin@email.com` | `superadmin123` | Super Admin | Acceso total al sistema |
| `admin@email.com` | `admin123` | Admin | Panel de administración |
| `vendedor@email.com` | `vendedor123` | Vendedor | Gestión de tienda y productos |
| `cliente@email.com` | `cliente123` | Comprador | Compra y recomendaciones |
| `visitante@email.com` | `visitante123` | Visitante | Solo navegación pública |

Además, el vendedor tiene una tienda asignada (`Tienda de Vendedor Ejemplo`) y
existen 30 productos de ejemplo publicados por `venta2@test.com`.

## Sistema de Roles

| Rol | Backend (`require_rol`) | Frontend (vistas) |
|-----|------------------------|-------------------|
| `superadmin` | Todo acceso | `admin`, `tienda`, `perfil`, `recomendaciones` |
| `admin` | Panel admin, gestión | `admin`, `tienda`, `perfil`, `recomendaciones` |
| `vendedor` | CRUD productos propios | `tienda`, `perfil`, `recomendaciones` |
| `cliente` | Compra, recomendaciones | `perfil`, `recomendaciones` |
| `visitante` | Solo lectura pública | Navegación básica |

- Al registrarse solo se permiten los roles `cliente` y `vendedor`.
- Los roles `superadmin`, `admin` y `visitante` se asignan desde seed o BD.

## API

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro (rol: `cliente` \| `vendedor`) |
| POST | `/auth/login` | Inicio de sesión |
| GET | `/auth/me` | Perfil del usuario autenticado |

### Tiendas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tiendas/{id}` | Obtener tienda por ID |
| GET | `/tiendas/mi-tienda/mia` | Tienda del usuario autenticado |

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/productos/` | Crear producto (vendedor) |
| GET | `/productos/` | Listar productos |
| GET | `/productos/{id}` | Obtener producto |
| DELETE | `/productos/{id}` | Eliminar producto |

### Personas, Ventas, Categorías, Recomendaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/personas/` | Crear persona |
| GET | `/personas/` | Listar personas |
| DELETE | `/personas/{id}` | Eliminar persona |
| POST | `/ventas/` | Registrar venta |
| GET | `/ventas/{id}` | Obtener factura |
| GET | `/categorias` | Listar categorías |
| GET | `/recomendaciones/{persona_id}` | Recomendar clientes cercanos |
| GET | `/health` | Health check |
| GET | `/health/connections` | Estado de conexiones a cada DB |

Documentación interactiva: `http://localhost:8000/docs`
