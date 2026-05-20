import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Zap, Shield } from 'lucide-react'
import type { Producto } from '../types'
import { getProductos } from '../api/productos'
import { getCategorias } from '../api/categorias'

const categories = [
  { name: 'Electrónica', icon: '📱', color: '#6c63ff' },
  { name: 'Hogar', icon: '🏠', color: '#ff6b6b' },
  { name: 'Moda', icon: '👕', color: '#ffa94d' },
  { name: 'Deportes', icon: '⚽', color: '#51cf66' },
  { name: 'Libros', icon: '📚', color: '#339af0' },
  { name: 'Juguetes', icon: '🎮', color: '#f06595' },
]

function Home() {
  const [destacados, setDestacados] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    getProductos().then(setDestacados).catch(() => {})
    getCategorias().then(setCategorias).catch(() => {})
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)',
        borderRadius: 16, padding: '3rem 2rem', marginBottom: '2rem',
        textAlign: 'center', border: '1px solid rgba(108,99,255,0.15)',
      }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: '0 0 0.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
          Descubre <span style={{ color: '#6c63ff' }}>Productos Únicos</span>
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem', margin: '0 0 1.5rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
          El marketplace con las mejores ofertas. Tecnología, moda, hogar y más.
        </p>
        <Link to="/productos" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#6c63ff', color: '#fff', padding: '0.7rem 1.5rem',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600,
        }}>
          Explorar <ArrowRight size={18} />
        </Link>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <Zap size={22} />, title: 'Envío Rápido', desc: 'Entrega en 24-48 horas' },
          { icon: <Shield size={22} />, title: 'Compra Segura', desc: 'Pagos protegidos' },
          { icon: <TrendingUp size={22} />, title: 'Mejores Precios', desc: 'Ofertas exclusivas' },
        ].map(f => (
          <div key={f.title} style={{ background: '#0f0f2a', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#6c63ff', marginBottom: '0.5rem' }}>{f.icon}</div>
            <h3 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: '1rem' }}>{f.title}</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.85rem' }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.25rem' }}>Categorías</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          {categories.map(c => (
            <Link key={c.name} to={`/productos?categoria=${encodeURIComponent(c.name)}`} style={{
              textDecoration: 'none', background: '#0f0f2a', borderRadius: 12, padding: '1rem',
              textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <div style={{ color: '#ccc', fontSize: '0.85rem', fontWeight: 500 }}>{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>Productos Destacados</h2>
          <Link to="/productos" style={{ color: '#6c63ff', textDecoration: 'none', fontSize: '0.9rem' }}>Ver todos →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {destacados.slice(0, 8).map(p => (
            <Link key={p.id} to={`/productos/${p.id}`} style={{
              textDecoration: 'none', background: '#0f0f2a', borderRadius: 12, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s',
            }}>
              <div style={{ height: 160, background: '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem', opacity: 0.3 }}>📦</span>
                )}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <div style={{ color: '#6c63ff', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{p.categoria}</div>
                <h3 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 500 }}>{p.nombre}</h3>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(p.precio)}</div>
              </div>
            </Link>
          ))}
          {destacados.length === 0 && (
            <p style={{ color: '#555', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              Aún no hay productos. ¡Sé el primero en publicar!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
