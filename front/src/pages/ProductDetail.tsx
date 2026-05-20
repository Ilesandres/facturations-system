import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Clock, MapPin, Store, Trash2 } from 'lucide-react'
import type { Producto } from '../types'
import { getProducto, deleteProducto } from '../api/productos'
import { useAuth } from '../context/AuthContext'
import { theme, card, btn, fmt, glowBg } from '../styles'

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
      <div style={{ ...card(false), height: 350, background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)' }} />
      <div style={{ ...card(false), padding: '2rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 16, width: `${60 - i * 10}%`, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '1rem' }} />
        ))}
      </div>
    </div>
  )
  if (!producto) return null

  const esMiProducto = usuario && producto.vendedor_id === usuario.id

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto?')) return
    try { await deleteProducto(producto.id); navigate('/productos') }
    catch { alert('Error al eliminar') }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ ...glowBg, top: '-10%', left: '20%', background: theme.primary }} />
      <button onClick={() => navigate(-1)} style={{ ...btn('ghost'), marginBottom: '1rem', background: 'transparent', border: 'none', color: theme.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0', position: 'relative', zIndex: 1 }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ ...card(false), overflow: 'hidden', minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)' }}>
          {producto.image_url ? (
            <>
              {!imgLoaded && <Package size={60} style={{ opacity: 0.2, color: '#fff', position: 'absolute' }} />}
              <img
                src={producto.image_url}
                alt={producto.nombre}
                onLoad={() => setImgLoaded(true)}
                style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', opacity: imgLoaded ? 1 : 0, transition: `opacity 0.4s` }}
              />
            </>
          ) : (
            <Package size={80} style={{ opacity: 0.15, color: '#fff' }} />
          )}
        </div>

        <div style={{ ...card(false), padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ background: theme.primaryLight, color: theme.primary, padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{producto.categoria}</span>
            {producto.stock <= 5 && producto.stock > 0 && (
              <span style={{ background: `${theme.warning}15`, color: theme.warning, padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                Últimas {producto.stock} unidades
              </span>
            )}
          </div>

          <h1 style={{ color: '#fff', margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>{producto.nombre}</h1>

          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
            {fmt(producto.precio)}
            <span style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 400, marginLeft: '0.5rem' }}>{producto.moneda}</span>
          </div>

          <p style={{ color: theme.textSecondary, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            {producto.descripcion || 'Sin descripción disponible para este producto.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: producto.stock > 0 ? theme.success : theme.danger, fontSize: '0.85rem', background: 'rgba(81,207,102,0.08)', borderRadius: theme.radiusSm, padding: '0.3rem 0.7rem' }}>
              <Package size={14} /> {producto.stock > 0 ? `${producto.stock} en stock` : 'Agotado'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: theme.textSecondary, fontSize: '0.85rem', background: 'rgba(255,255,255,0.04)', borderRadius: theme.radiusSm, padding: '0.3rem 0.7rem' }}>
              <Clock size={14} /> Envío exprés
            </div>
          </div>

          <button style={{ ...btn('primary'), width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', boxShadow: `0 8px 24px ${theme.primaryGlow}` }}>
            <ShoppingCart size={18} /> Comprar ahora
          </button>

          {esMiProducto && (
            <button onClick={handleDelete} style={{ ...btn('danger'), width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.6rem' }}>
              <Trash2 size={16} /> Eliminar producto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
