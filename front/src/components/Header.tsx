import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, LogOut, Package, Store, ChevronDown, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { theme, glass, btn } from '../styles'

function Header() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('mousedown', onClick) }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/productos?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header style={{
      ...glass,
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
      transition: `box-shadow ${theme.transition}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${theme.primaryGlow}` }}>
              <ShoppingCart size={18} color="#fff" />
            </div>
            <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Nova<span style={{ color: theme.primary }}>Mart</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos, categorías..."
              style={{
                width: '100%', padding: '0.6rem 2.8rem 0.6rem 1.2rem', borderRadius: 50,
                border: `1px solid ${theme.border}`,
                background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontSize: '0.9rem', outline: 'none',
                transition: `all ${theme.transition}`,
              }}
              onFocus={e => { e.target.style.borderColor = theme.primary; e.target.style.background = 'rgba(108,99,255,0.08)' }}
              onBlur={e => { e.target.style.borderColor = theme.border; e.target.style.background = 'rgba(255,255,255,0.05)' }}
            />
            <button type="submit" style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: theme.primary, border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: `all ${theme.transition}`,
            }}>
              <Search size={16} />
            </button>
          </form>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/productos" style={{ ...btn('ghost'), padding: '0.45rem 0.9rem', textDecoration: 'none', fontSize: '0.85rem' }}>
              <Package size={15} /> Productos
            </Link>

            {usuario ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: showUserMenu ? theme.primaryLight : 'transparent',
                  border: `1px solid ${showUserMenu ? theme.borderHover : theme.border}`,
                  borderRadius: theme.radiusSm, padding: '0.4rem 0.8rem',
                  color: '#fff', cursor: 'pointer', transition: `all ${theme.transition}`,
                }}>
                  {usuario.avatar_url ? (
                    <img src={usuario.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={14} color={theme.primary} />
                  </div>}
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{usuario.nombre}</span>
                  <ChevronDown size={14} style={{ opacity: 0.5, transform: showUserMenu ? 'rotate(180deg)' : '', transition: theme.transition }} />
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    background: theme.bgCard, border: `1px solid ${theme.border}`,
                    borderRadius: theme.radius, minWidth: 200, overflow: 'hidden',
                    boxShadow: theme.shadow, zIndex: 200,
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.border}` }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{usuario.nombre}</div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>{usuario.email}</div>
                    </div>
                    {[
                      { to: '/perfil', icon: <User size={15} />, label: 'Mi Perfil' },
                      { to: '/tienda', icon: <Store size={15} />, label: 'Mi Tienda' },
                      { to: '/recomendaciones', icon: <Sparkles size={15} />, label: 'Recomendaciones' },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', color: theme.textSecondary, textDecoration: 'none', fontSize: '0.85rem', transition: `background ${theme.transition}` }}>
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { setShowUserMenu(false); logout() }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', color: theme.danger, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', borderTop: `1px solid ${theme.border}` }}>
                      <LogOut size={15} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ ...btn('ghost'), textDecoration: 'none', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>Ingresar</Link>
                <Link to="/register" style={{ ...btn('primary'), textDecoration: 'none', padding: '0.45rem 1rem', fontSize: '0.85rem', boxShadow: `0 4px 14px ${theme.primaryGlow}` }}>Crear Cuenta</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
