import { Outlet, NavLink } from 'react-router-dom'

function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <strong style={{ fontSize: '1.125rem' }}>Mini Ventas</strong>
          <NavLink to="/personas" className={linkClass}>Personas</NavLink>
          <NavLink to="/productos" className={linkClass}>Productos</NavLink>
          <NavLink to="/ventas" className={linkClass}>Ventas</NavLink>
          <NavLink to="/recomendaciones" className={linkClass}>Recomendaciones</NavLink>
        </div>
      </nav>
      <main style={{ maxWidth: '1200px', margin: '1.5rem auto', padding: '0 1.5rem' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
