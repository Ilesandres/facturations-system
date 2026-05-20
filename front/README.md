# Frontend — React 19 + Vite 6 + TypeScript

## Iniciar

```bash
cd front
npm install
npm run dev
```

Abrir `http://localhost:5173`

## Variables de entorno (`front/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend (default: `http://localhost:8000`) |

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/personas` | PersonaList | CRUD de personas (Cassandra) |
| `/productos` | ProductoList | CRUD de productos (MongoDB) |
| `/ventas` | VentaList | Registrar y ver facturas (MySQL) |
| `/recomendaciones` | RecomendacionList | Recomendaciones vía Neo4j |
