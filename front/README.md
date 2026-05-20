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

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/` | Home | Público | Landing page |
| `/login` | Login | Público | Inicio de sesión |
| `/register` | Register | Público | Registro (elige `cliente` \| `vendedor`) |
| `/productos` | Products | Público | Catálogo de productos |
| `/productos/:id` | ProductDetail | Público | Detalle del producto |
| `/perfil` | Profile | Usuario autenticado | Perfil con rol y tienda |
| `/tienda` | Store | `vendedor`, `admin`, `superadmin` | Gestión de productos propios |
| `/admin` | Admin | `admin`, `superadmin` | Panel de administración |
| `/recomendaciones` | Recommendations | Autenticado (excepto `visitante`) | Recomendaciones de productos |

## Guard de roles en componentes

Cada página verifica el rol del usuario desde `useAuth()`:

```tsx
const { usuario } = useAuth()

if (!usuario || !['admin', 'superadmin'].includes(usuario.rol)) {
  return <p>No tienes acceso</p>
}
```

## Navegación condicional (Header)

- **"Mi Tienda"** — visible solo para `vendedor`, `admin`, `superadmin`
- **"Panel Admin"** — visible solo para `admin`, `superadmin`
- **"Recomendaciones"** — visible para todos excepto `visitante`
- El menú de usuario muestra el nombre del rol debajo del email

## Temas

Soporte de modo claro/oscuro con persistencia en `localStorage`.
Tema por defecto según preferencia del sistema (`prefers-color-scheme`).
