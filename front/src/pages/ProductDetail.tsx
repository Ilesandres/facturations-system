import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react'
import type { Producto } from '../types'
import { getProducto, deleteProducto } from '../api/productos'
import { useAuth } from '../context/AuthContext'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProducto(id).then(setProducto).catch(() => navigate('/productos')).finally(() => setLoading(false))
  }, [id])

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  if (loading) return <p style={{ color: '#666' }}>Cargando...</p>
  if (!producto) return null

  const esMiProducto = usuario && producto.vendedor_id === usuario.id

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProducto(producto.id)
      navigate('/productos')
    } catch { alert('Error al eliminar') }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#0f0f2a', borderRadius: 16, padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ background: '#1a1a3e', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          {producto.image_url ? (
            <img src={producto.image_url} alt={producto.nombre} style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <Package size={80} style={{ opacity: 0.3, color: '#fff' }} />
          )}
        </div>

        <div>
          <div style={{ color: '#6c63ff', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{producto.categoria}</div>
          <h1 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.5rem' }}>{producto.nombre}</h1>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1rem' }}>{producto.descripcion || 'Sin descripción'}</p>

          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#6c63ff', marginBottom: '1rem' }}>{fmt(producto.precio)}</div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(81,207,102,0.1)', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: '#51cf66' }}>
              {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </div>
            <div style={{ background: 'rgba(108,99,255,0.1)', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: '#6c63ff' }}>
              {producto.moneda}
            </div>
          </div>

          <button style={{
            padding: '0.75rem 2rem', borderRadius: 8, border: 'none',
            background: '#6c63ff', color: '#fff', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
          }}>
            <ShoppingCart size={18} /> Comprar
          </button>

          {esMiProducto && (
            <button onClick={handleDelete} style={{
              marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: 8,
              border: '1px solid #ff6b6b', background: 'transparent', color: '#ff6b6b',
              cursor: 'pointer', fontSize: '0.85rem', display: 'block',
            }}>
              Eliminar producto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
