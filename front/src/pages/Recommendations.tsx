import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, Image as ImageIcon } from 'lucide-react'
import { getRecomendaciones } from '../api/recomendaciones'
import { useAuth } from '../context/AuthContext'
import type { RecomendacionProducto } from '../types'
import { card, cardHover, fmt } from '../styles'

function Recommendations() {
  const { usuario } = useAuth()
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    getRecomendaciones().then(setRecomendaciones).catch(() => {}).finally(() => setLoading(false))
  }, [usuario])

  if (!usuario) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>Inicia sesión para ver recomendaciones</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px var(--primary-glow)' }}>
          <Sparkles size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Recomendaciones</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0 0', fontSize: '0.85rem' }}>Productos que podrían gustarte</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...card(false), padding: 0, overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 120 }} />
              <div style={{ padding: '0.75rem' }}>
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: '0.4rem' }} />
                <div className="skeleton" style={{ height: 14, width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : recomendaciones.length === 0 ? (
        <div style={{ ...card(false), padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Sparkles size={56} style={{ opacity: 0.1, color: 'var(--text)', marginBottom: '0.75rem' }} />
          <h3 style={{ color: 'var(--text)', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Sin recomendaciones aún</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem', fontSize: '0.9rem' }}>Explora productos para recibir sugerencias.</p>
          <Link to="/productos" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <TrendingUp size={16} /> Explorar productos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {recomendaciones.map(r => (
            <Link
              key={r.producto_id}
              to={`/productos/${r.producto_id}`}
              style={{
                textDecoration: 'none', ...card(false), overflow: 'hidden',
                ...(hoveredId === r.producto_id ? cardHover : {}),
              }}
              onMouseEnter={() => setHoveredId(r.producto_id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-card-hover), var(--bg-card))' }}>
                {r.image_url ? (
                  <img src={r.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <ImageIcon size={32} style={{ opacity: 0.15, color: 'var(--text)' }} />}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{ color: 'var(--text)', margin: '0.2rem 0', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.nombre || 'Producto recomendado'}
                </h3>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }}>
                  {r.precio ? fmt(r.precio) : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                  <Sparkles size={12} color="var(--primary)" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Score: {r.score}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recommendations
