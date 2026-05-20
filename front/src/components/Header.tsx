import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, LogOut, Package, Store, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/productos?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={28} color="#6c63ff" />
            <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
              Nova<span style={{ color: '#6c63ff' }}>Mart</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              style={{
                width: '100%', padding: '0.6rem 2.5rem 0.6rem 1rem', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)',
                color: '#fff', fontSize: '0.9rem', outline: 'none',
              }}
            />
            <button type="submit" style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#6c63ff',
            }}>
              <Search size={18} />
            </button>
          </form>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/productos" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' }}>Productos</Link>
            <Link to="/categorias" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' }}>Categorías</Link>

            {usuario ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 8, padding: '0.4rem 0.8rem', color: '#fff', cursor: 'pointer',
                }}>
                  {usuario.avatar_url ? (
                    <img src={usuario.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : <User size={18} />}
                  <span style={{ fontSize: '0.85rem' }}>{usuario.nombre}</span>
                  <ChevronDown size={14} />
                </button>
                {showUserMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 4,
                    background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, minWidth: 180, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}>
                    <Link to="/perfil" onClick={() => setShowUserMenu(false)} style={menuItemStyle}>
                      <User size={16} /> Mi Perfil
                    </Link>
                    <Link to="/tienda" onClick={() => setShowUserMenu(false)} style={menuItemStyle}>
                      <Store size={16} /> Mi Tienda
                    </Link>
                    <Link to="/recomendaciones" onClick={() => setShowUserMenu(false)} style={menuItemStyle}>
                      <Package size={16} /> Recomendaciones
                    </Link>
                    <button onClick={() => { setShowUserMenu(false); logout() }} style={{ ...menuItemStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)' }}>Ingresar</Link>
                <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 6, background: '#6c63ff' }}>Crear Cuenta</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.6rem 1rem', color: '#ddd', textDecoration: 'none', fontSize: '0.85rem',
}

export default Header
