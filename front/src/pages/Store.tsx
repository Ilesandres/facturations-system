import { useEffect, useState } from 'react'
import { Plus, Package, Trash2, Image, Store as StoreIcon } from 'lucide-react'
import type { Producto, Categoria } from '../types'
import { getProductos, createProducto, deleteProducto } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { useAuth } from '../context/AuthContext'
import { card, cardHover, inputStyle, btn, fmt } from '../styles'

function Store() {
  const { usuario } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', image_url: '' })
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    Promise.all([
      getProductos({ vendedor_id: usuario.id }).then(setProductos),
      getCategorias().then(r => setCategorias(r.items)),
    ]).finally(() => setLoading(false))
  }, [usuario])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createProducto({
        nombre: form.nombre, descripcion: form.descripcion,
        precio: parseFloat(form.precio), moneda: 'COP',
        stock: parseInt(form.stock || '0'), categoria_id: form.categoria_id || (categorias[0]?.id || ''),
        image_url: form.image_url,
      })
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', image_url: '' })
      const updated = await getProductos({ vendedor_id: usuario!.id })
      setProductos(updated)
    } catch { alert('Error al crear producto') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar producto?')) return
    try { await deleteProducto(id); setProductos(prev => prev.filter(p => p.id !== id)) }
    catch { alert('Error al eliminar') }
  }

  if (!usuario || !['vendedor', 'admin', 'superadmin'].includes(usuario.rol)) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>{!usuario ? 'Inicia sesión para gestionar tu tienda' : 'No tienes acceso a esta sección'}</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px var(--primary-glow)' }}>
            <StoreIcon size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Mi Tienda</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0 0', fontSize: '0.85rem' }}>{productos.length} producto{productos.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btn('primary') }}>
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="animate-in" style={{ ...card(false), padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text)', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Publicar producto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} required />
            </div>
            {[
              { field: 'precio', label: 'Precio (COP) *', type: 'number' },
              { field: 'stock', label: 'Stock *', type: 'number' },
              { field: 'categoria_id', label: 'Categoría', type: 'select' },
              { field: 'image_url', label: 'URL de Imagen', type: 'text' },
            ].map(({ field, label, type }) => (
              <div key={field}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                {type === 'select' ? (
                  <select value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))} style={inputStyle}>
                    <option value="">Seleccionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                ) : (
                  <input type={type} value={form[field as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} required={field !== 'image_url'} />
                )}
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            </div>
          </div>
          <button type="submit" style={{ ...btn('primary'), marginTop: '1rem' }}>
            <Plus size={16} /> Publicar
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ ...card(false), padding: 0, overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 130 }} />
              <div style={{ padding: '0.75rem' }}>
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: '0.4rem' }} />
                <div className="skeleton" style={{ height: 14, width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {productos.map(p => (
            <div
              key={p.id}
              style={{ ...card(false), overflow: 'hidden', position: 'relative', ...(hoveredId === p.id ? cardHover : {}) }}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-card-hover), var(--bg-card))' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <Image size={32} style={{ opacity: 0.15, color: 'var(--text)' }} />}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <h3 style={{ color: 'var(--text)', margin: '0.2rem 0', fontSize: '0.85rem', fontWeight: 600 }}>{p.nombre}</h3>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }}>{fmt(p.precio)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ color: p.stock > 0 ? 'var(--text-secondary)' : 'var(--danger)', fontSize: '0.8rem' }}>
                    Stock: {p.stock}
                  </span>
                  <button onClick={() => handleDelete(p.id)} style={{ ...btn('danger'), padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {productos.length === 0 && (
            <div style={{ ...card(false), gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
              <Package size={48} style={{ opacity: 0.12, color: 'var(--text)', marginBottom: '0.75rem' }} />
              <h3 style={{ color: 'var(--text)', margin: '0 0 0.3rem', fontSize: '1.1rem' }}>No has publicado productos</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>¡Comienza a vender hoy!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Store
