import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { getRecomendaciones } from '../api/recomendaciones'
import { useAuth } from '../context/AuthContext'

function Recommendations() {
  const { usuario } = useAuth()
  const [recomendaciones, setRecomendaciones] = useState<{ producto_id: string; score: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    getRecomendaciones().then(setRecomendaciones).catch(() => {}).finally(() => setLoading(false))
  }, [usuario])

  if (!usuario) return <p style={{ color: '#666' }}>Inicia sesión para ver recomendaciones</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Sparkles size={24} color="#6c63ff" />
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>Recomendaciones para ti</h2>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Cargando recomendaciones...</p>
      ) : recomendaciones.length === 0 ? (
        <div style={{ background: '#0f0f2a', borderRadius: 12, padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Sparkles size={40} style={{ opacity: 0.3, color: '#fff', marginBottom: '0.5rem' }} />
          <p style={{ color: '#555' }}>Aún no hay recomendaciones. Explora productos para recibir sugerencias personalizadas.</p>
          <Link to="/productos" style={{ color: '#6c63ff', textDecoration: 'none' }}>Explorar productos →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {recomendaciones.map(r => (
            <Link key={r.producto_id} to={`/productos/${r.producto_id}`} style={{
              textDecoration: 'none', background: '#0f0f2a', borderRadius: 12, padding: '1rem',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ color: '#6c63ff', fontSize: '0.8rem' }}>Producto recomendado</div>
              <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Score: {r.score}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recommendations
