import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Zap, Shield, Sparkles, ChevronRight } from 'lucide-react'
import type { Producto } from '../types'
import { getProductos } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { theme, card, cardHover, glowBg, fmt } from '../styles'

const categories = [
  { name: 'Electrónica', icon: '📱', color: '#6c63ff' },
  { name: 'Hogar', icon: '🏠', color: '#ff6b6b' },
  { name: 'Moda', icon: '👕', color: '#ffa94d' },
  { name: 'Deportes', icon: '⚽', color: '#51cf66' },
  { name: 'Libros', icon: '📚', color: '#339af0' },
  { name: 'Juguetes', icon: '🎮', color: '#f06595' },
  { name: 'Jardín', icon: '🌿', color: '#20c997' },
  { name: 'Música', icon: '🎵', color: '#e599f7' },
]

function ProductCard({ p }: { p: Producto }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={`/productos/${p.id}`}
      style={{ textDecoration: 'none', ...card(), ...(hover ? cardHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        height: 170, background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform 0.4s`, transform: hover ? 'scale(1.08)' : 'scale(1)' }} />
        ) : (
          <span style={{ fontSize: '3rem', opacity: 0.2 }}>📦</span>
        )}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: theme.primaryLight, color: theme.primary, fontSize: '0.7rem',
          padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 600,
        }}>{p.categoria}</div>
      </div>
      <div style={{ padding: '0.85rem' }}>
        <h3 style={{ color: '#fff', margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.3 }}>{p.nombre}</h3>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.3rem' }}>{fmt(p.precio)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: p.stock > 0 ? theme.success : theme.danger }}>
            {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
          </span>
        </div>
      </div>
    </Link>
  )
}

function Home() {
  const [destacados, setDestacados] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    getProductos().then(setDestacados).catch(() => {})
    getCategorias().then(setCategorias).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #15153a 50%, #0a0a1a 100%)',
        borderRadius: theme.radiusLg, padding: '4rem 2.5rem', marginBottom: '2.5rem',
        border: `1px solid ${theme.border}`,
      }}>
        <div style={{ ...glowBg, top: '-20%', left: '-10%', background: theme.primary }} />
        <div style={{ ...glowBg, bottom: '-30%', right: '-10%', background: '#8b5cf6' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: theme.primaryLight, borderRadius: 50, padding: '0.3rem 1rem',
            marginBottom: '1rem', fontSize: '0.8rem', color: theme.primary,
          }}>
            <Sparkles size={14} /> Marketplace inteligente
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', margin: '0 0 0.5rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15 }}>
            Descubre productos <span style={{ background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>únicos</span>
            <br />con los mejores precios
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '1.05rem', margin: '0 auto 2rem', maxWidth: 500, lineHeight: 1.6 }}>
            El marketplace donde encuentras tecnología, moda, hogar y más. Envíos rápidos y compra segura.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/productos" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`,
              color: '#fff', padding: '0.75rem 1.8rem', borderRadius: 50,
              textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
              boxShadow: `0 8px 25px ${theme.primaryGlow}`,
              transition: `all ${theme.transition}`,
            }}>
              Explorar productos <ArrowRight size={18} />
            </Link>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center',
              border: `1px solid ${theme.border}`, color: '#fff',
              padding: '0.75rem 1.8rem', borderRadius: 50,
              textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem',
              transition: `all ${theme.transition}`,
            }}>
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: <Zap size={20} />, title: 'Envío Rápido', desc: 'Entrega en 24-48 horas' },
          { icon: <Shield size={20} />, title: 'Compra Segura', desc: 'Pagos protegidos' },
          { icon: <TrendingUp size={20} />, title: 'Mejores Precios', desc: 'Ofertas exclusivas' },
          { icon: <Sparkles size={20} />, title: 'Recomendaciones', desc: 'Productos para ti' },
        ].map(f => (
          <div key={f.title} style={{ ...card(false), padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary, flexShrink: 0 }}>
              {f.icon}
            </div>
            <div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{f.title}</h3>
              <p style={{ color: theme.textSecondary, margin: '0.1rem 0 0', fontSize: '0.8rem' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Categorías</h2>
          <Link to="/productos" style={{ color: theme.primary, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {categories.map(c => (
            <Link key={c.name} to={`/productos?categoria=${encodeURIComponent(c.name)}`}
              style={{
                ...card(), padding: '1rem', textAlign: 'center', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
              }}>
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>{c.icon}</div>
              <div style={{ color: '#ccc', fontSize: '0.8rem', fontWeight: 500 }}>{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
            <span style={{ color: theme.primary }}>⋆</span> Productos Destacados
          </h2>
          <Link to="/productos" style={{ color: theme.primary, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {destacados.slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}
          {destacados.length === 0 && (
            <div style={{ ...card(false), gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: theme.textMuted, margin: 0 }}>Aún no hay productos. ¡Sé el primero en publicar!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
