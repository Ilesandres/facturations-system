import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Clock, Trash2, Tag } from 'lucide-react'
import type { Producto } from '../types'
import { getProducto, deleteProducto } from '../api/productos'
import { useAuth } from '../context/AuthContext'
import { card, btn, fmt } from '../styles'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProducto(id).then(setProducto).catch(() => navigate('/productos')).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="skeleton" style={{ minHeight: 350, borderRadius: 'var(--radius)' }} />
      <div style={{ ...card(false), padding: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 16, width: `${60 - i * 10}%`, marginBottom: '1rem' }} />
        ))}
      </div>
    </div>
  )
  if (!producto) return null

  const esMiProducto = usuario && producto.vendedor_id === usuario.id

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto?')) return
    try { await deleteProducto(producto!.id); navigate('/productos') }
    catch { alert('Error al eliminar') }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.06, pointerEvents: 'none', top: '-10%', left: '20%', background: 'var(--primary)' }} />
      <button onClick={() => navigate(-1)} style={{ ...btn('ghost'), marginBottom: '1rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0', position: 'relative', zIndex: 1 }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ ...card(false), overflow: 'hidden', minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-card-hover), var(--bg-card))' }}>
          {producto.image_url ? (
            <>
              {!imgLoaded && <div className="skeleton" style={{ width: '80%', height: 250, position: 'absolute' }} />}
              <img
                src={producto.image_url}
                alt={producto.nombre}
                onLoad={() => setImgLoaded(true)}
                style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s' }}
              />
            </>
          ) : (
            <Package size={80} style={{ opacity: 0.12, color: 'var(--text)' }} />
          )}
        </div>

        <div style={{ ...card(false), padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {fmt(producto.precio)}
          </div>

          <h1 style={{ color: 'var(--text)', margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>{producto.nombre}</h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
            {producto.descripcion || 'Sin descripción disponible.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: producto.stock > 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', background: 'var(--success-light)', borderRadius: 50, padding: '0.35rem 0.9rem', fontWeight: 500 }}>
              <Package size={14} /> {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', background: 'var(--bg-input)', borderRadius: 50, padding: '0.35rem 0.9rem' }}>
              <Clock size={14} /> Envío exprés
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', background: 'var(--bg-input)', borderRadius: 50, padding: '0.35rem 0.9rem' }}>
              <Tag size={14} /> {producto.moneda}
            </div>
          </div>

          <button style={{
            ...btn('primary'), width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem',
            boxShadow: '0 8px 24px var(--primary-glow)',
          }}>
            <ShoppingCart size={18} /> Comprar ahora
          </button>

          {esMiProducto && (
            <button onClick={handleDelete} style={{
              ...btn('danger'), width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.65rem',
            }}>
              <Trash2 size={16} /> Eliminar producto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
