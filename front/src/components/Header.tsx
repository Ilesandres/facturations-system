import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, LogOut, Package, Store, ChevronDown, Sparkles, Sun, Moon, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { theme, btn } from '../styles'

function Header() {
  const { usuario, logout } = useAuth()
  const { resolved, toggle } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/productos?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.15)' : 'none',
      transition: `all ${theme.transition}`,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.7rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}>
              <ShoppingCart size={17} color="#fff" />
            </div>
            {!isMobile && (
              <span style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Nova<span style={{ color: 'var(--primary)' }}>Mart</span>
              </span>
            )}
          </Link>

          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420, position: 'relative', minWidth: 0 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '0.55rem 2.8rem 0.55rem 1rem', borderRadius: 50,
                border: `1px solid ${searchFocused ? 'var(--border-hover)' : 'var(--border)'}`,
                background: 'var(--bg-input)',
                color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
                transition: `all ${theme.transition}`,
              }}
            />
            <button type="submit" style={{
              position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--primary)', border: 'none', borderRadius: '50%',
              width: 30, height: 30, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={15} />
            </button>
          </form>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <button onClick={toggle} title="Cambiar tema"
              style={{
                width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: `all ${theme.transition}`, flexShrink: 0,
              }}>
              {resolved === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {isMobile ? (
              <button onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  width: 34, height: 34, borderRadius: theme.radiusSm,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            ) : (
              <>
                <Link to="/productos" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.8rem', borderRadius: theme.radiusSm,
                  fontSize: '0.85rem', fontWeight: 500,
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: `all ${theme.transition}`, whiteSpace: 'nowrap',
                }}>
                  <Package size={15} /> Productos
                </Link>

                {usuario ? (
                  <div ref={menuRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: showUserMenu ? 'var(--primary-light)' : 'transparent',
                      border: `1px solid ${showUserMenu ? 'var(--border-hover)' : 'var(--border)'}`,
                      borderRadius: theme.radiusSm, padding: '0.35rem 0.7rem',
                      color: 'var(--text)', cursor: 'pointer', transition: `all ${theme.transition}`,
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={13} color="var(--primary)" />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{usuario.nombre}</span>
                      <ChevronDown size={13} style={{ opacity: 0.5, transform: showUserMenu ? 'rotate(180deg)' : '', transition: theme.transition }} />
                    </button>

                    {showUserMenu && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: theme.radius, minWidth: 200, overflow: 'hidden',
                        boxShadow: 'var(--shadow-lg)', zIndex: 200,
                      }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>{usuario.nombre}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{usuario.email}</div>
                        </div>
                        {[
                          { to: '/perfil', icon: <User size={15} />, label: 'Mi Perfil' },
                          { to: '/tienda', icon: <Store size={15} />, label: 'Mi Tienda' },
                          { to: '/recomendaciones', icon: <Sparkles size={15} />, label: 'Recomendaciones' },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setShowUserMenu(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem',
                              color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem',
                              transition: `background ${theme.transition}`,
                            }}>
                            {item.icon} {item.label}
                          </Link>
                        ))}
                        <button onClick={() => { setShowUserMenu(false); logout() }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem',
                            color: 'var(--danger)', background: 'none', border: 'none', width: '100%',
                            textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem',
                            borderTop: '1px solid var(--border)',
                          }}>
                          <LogOut size={15} /> Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/login" style={{
                      ...btn('ghost'), textDecoration: 'none', padding: '0.4rem 0.9rem', fontSize: '0.85rem',
                      border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    }}>Ingresar</Link>
                    <Link to="/register" style={{
                      ...btn('primary'), textDecoration: 'none', padding: '0.4rem 0.9rem', fontSize: '0.85rem',
                    }}>Crear Cuenta</Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Mobile nav drawer */}
        {isMobile && mobileOpen && (
          <div className="animate-in" style={{
            marginTop: '0.75rem', paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <Link to="/productos" onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem',
                  borderRadius: theme.radiusSm, fontSize: '0.9rem', fontWeight: 500,
                  color: 'var(--text)', textDecoration: 'none',
                  transition: `background ${theme.transition}`,
                }}>
                <Package size={16} /> Productos
              </Link>
              {usuario ? (
                <>
                  {[
                    { to: '/perfil', icon: <User size={16} />, label: 'Mi Perfil' },
                    { to: '/tienda', icon: <Store size={16} />, label: 'Mi Tienda' },
                    { to: '/recomendaciones', icon: <Sparkles size={16} />, label: 'Recomendaciones' },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem',
                        borderRadius: theme.radiusSm, fontSize: '0.9rem', fontWeight: 500,
                        color: 'var(--text)', textDecoration: 'none',
                        transition: `background ${theme.transition}`,
                      }}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setMobileOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem',
                      color: 'var(--danger)', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left',
                      borderTop: '1px solid var(--border)', marginTop: '0.3rem', paddingTop: '0.75rem',
                    }}>
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    style={{
                      ...btn('ghost'), textDecoration: 'none', padding: '0.5rem 1.2rem', fontSize: '0.9rem',
                      border: '1px solid var(--border)', color: 'var(--text-secondary)', flex: 1,
                      justifyContent: 'center',
                    }}>Ingresar</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    style={{
                      ...btn('primary'), textDecoration: 'none', padding: '0.5rem 1.2rem', fontSize: '0.9rem',
                      flex: 1, justifyContent: 'center',
                    }}>Crear Cuenta</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
