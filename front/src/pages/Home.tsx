import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Zap, Shield, Sparkles, ChevronRight, ShoppingCart, Star } from 'lucide-react'
import type { Producto, Categoria } from '../types'
import { getProductos } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { card, cardHover, fmt } from '../styles'

const categoryIcons = ['📱', '🏠', '👕', '⚽', '📚', '🎮', '🌿', '🎵']



function ProductCard({ p, i }: { p: Producto; i: number }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={`/productos/${p.id}`}
      className={`animate-in animate-in-d${(i % 6) + 1}`}
      style={{ textDecoration: 'none', ...card(), ...(hover ? cardHover : {}), overflow: 'hidden' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--bg-card-hover), var(--bg-card))',
      }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform 0.5s`, transform: hover ? 'scale(1.1)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={28} style={{ opacity: 0.4, color: 'var(--primary)' }} />
          </div>
        )}
      </div>
      <div style={{ padding: '0.85rem 1rem' }}>
        <h3 style={{ color: 'var(--text)', margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3 }}>{p.nombre}</h3>
        <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.15rem' }}>{fmt(p.precio)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: p.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
            {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
          </span>
        </div>
      </div>
    </Link>
  )
}

function Home() {
  const [destacados, setDestacados] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    getProductos().then(setDestacados).catch(() => {})
    getCategorias().then(r => setCategorias(r.items)).catch(() => {})
  }, [])

  return (
    <div>
      <section style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--radius-lg)', padding: '4.5rem 2.5rem', marginBottom: '2.5rem',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--bg), var(--bg-card-hover) 50%, var(--bg))',
      }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none', top: '-30%', left: '-15%', background: 'var(--primary)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none', bottom: '-30%', right: '-10%', background: '#8b5cf6' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--primary-light)', borderRadius: 50, padding: '0.3rem 1rem',
            marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500,
          }}>
            <Sparkles size={14} /> Marketplace inteligente
          </div>
          <h1 style={{ color: 'var(--text)', fontSize: 'clamp(1.8rem, 4vw, 3rem)', margin: '0 0 0.5rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15 }}>
            Descubre productos {' '}
            <span style={{ background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>únicos</span>
            <br />con los mejores precios
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: '0 auto 2rem', maxWidth: 500, lineHeight: 1.6 }}>
            El marketplace donde encuentras tecnología, moda, hogar y más. Envíos rápidos y compra segura.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/productos"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                color: '#fff', padding: '0.75rem 2rem', borderRadius: 50,
                textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
                boxShadow: '0 8px 25px var(--primary-glow)',
                transition: 'all var(--transition)',
              }}>
              Explorar productos <ArrowRight size={18} />
            </Link>
            <Link to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center',
                border: '1px solid var(--border)', color: 'var(--text)',
                padding: '0.75rem 2rem', borderRadius: 50,
                textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem',
                transition: 'all var(--transition)',
              }}>
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: <Zap size={20} />, title: 'Envío Rápido', desc: 'Entrega en 24-48 horas' },
          { icon: <Shield size={20} />, title: 'Compra Segura', desc: 'Pagos protegidos' },
          { icon: <TrendingUp size={20} />, title: 'Mejores Precios', desc: 'Ofertas exclusivas' },
          { icon: <Sparkles size={20} />, title: 'Recomendaciones', desc: 'Productos para ti' },
        ].map((f, i) => (
          <div key={f.title} className={`animate-in animate-in-d${i + 1}`}
            style={{ ...card(false), padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              {f.icon}
            </div>
            <div>
              <h3 style={{ color: 'var(--text)', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0 0', fontSize: '0.8rem' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Categorías</h2>
          <Link to="/productos" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}>
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {categorias.length > 0 ? categorias.slice(0, 8).map((c, i) => (
            <Link key={c.id} to={`/productos?categoria_id=${c.id}`}
              className={`animate-in animate-in-d${i + 1}`}
              style={{
                ...card(), padding: '1.25rem 1rem', textAlign: 'center', textDecoration: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              }}>
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>{categoryIcons[i % categoryIcons.length]}</div>
              <div style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600 }}>{c.nombre}</div>
            </Link>
          )) : Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...card(false), padding: '1.25rem', textAlign: 'center' }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 auto 0.5rem' }} />
              <div className="skeleton" style={{ height: 12, width: '60%', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
            <Star size={16} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: '0.3rem' }} />
            Productos Destacados
          </h2>
          <Link to="/productos" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 500 }}>
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {destacados.slice(0, 8).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          {destacados.length === 0 && (
            <div style={{ ...card(false), gridColumn: '1 / -1', padding: '3.5rem 2rem', textAlign: 'center' }}>
              <ShoppingCart size={48} style={{ opacity: 0.12, color: 'var(--text)', marginBottom: '0.75rem' }} />
              <h3 style={{ color: 'var(--text)', margin: '0 0 0.3rem', fontSize: '1.1rem' }}>Aún no hay productos</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>¡Sé el primero en publicar!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
