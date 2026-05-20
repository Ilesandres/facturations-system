import { useEffect, useState } from 'react'
import { Plus, Package, Trash2, Image } from 'lucide-react'
import type { Producto } from '../types'
import { getProductos, createProducto, deleteProducto } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { useAuth } from '../context/AuthContext'
import { theme, card, cardHover, input, btn, fmt } from '../styles'

function Store() {
  const { usuario } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', image_url: '' })
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    Promise.all([
      getProductos({ vendedor_id: usuario.id }).then(setProductos),
      getCategorias().then(setCategorias),
    ]).finally(() => setLoading(false))
  }, [usuario])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const cat = form.categoria === '__new__' && newCat.trim() ? newCat.trim() : form.categoria
    try {
      await createProducto({
        nombre: form.nombre, descripcion: form.descripcion,
        precio: parseFloat(form.precio), moneda: 'COP',
        stock: parseInt(form.stock || '0'), categoria: cat || 'General',
        image_url: form.image_url,
      })
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', image_url: '' })
      setNewCat('')
      const updated = await getProductos({ vendedor_id: usuario!.id })
      setProductos(updated)
    } catch { alert('Error al crear producto') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar producto?')) return
    try { await deleteProducto(id); setProductos(prev => prev.filter(p => p.id !== id)) }
    catch { alert('Error al eliminar') }
  }

  if (!usuario) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: theme.textMuted }}>Inicia sesión para gestionar tu tienda</p>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Mi Tienda</h2>
          <p style={{ color: theme.textSecondary, margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{productos.length} producto{productos.length !== 1 ? 's' : ''} publicado{productos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btn('primary'), boxShadow: `0 4px 14px ${theme.primaryGlow}` }}>
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ ...card(false), padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Publicar producto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} style={input} required />
            </div>
            {[
              { field: 'precio', label: 'Precio *', type: 'number' },
              { field: 'stock', label: 'Stock *', type: 'number' },
              { field: 'categoria', label: 'Categoría', type: 'select' },
              { field: 'image_url', label: 'URL de Imagen', type: 'text' },
            ].map(({ field, label, type }) => (
              <div key={field}>
                <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                {type === 'select' ? (
                  <>
                    <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} style={input}>
                      <option value="">Seleccionar</option>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__new__">+ Nueva categoría</option>
                    </select>
                    {form.categoria === '__new__' && (
                      <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nombre nueva categoría" style={{ ...input, marginTop: '0.4rem' }} />
                    )}
                  </>
                ) : (
                  <input type={type} value={form[field as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={input} required={field !== 'image_url'} />
                )}
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} style={{ ...input, minHeight: 70, resize: 'vertical' }} />
            </div>
          </div>
          <button type="submit" style={{ ...btn('primary'), marginTop: '1rem', boxShadow: `0 4px 14px ${theme.primaryGlow}` }}>
            <Plus size={16} /> Publicar
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ ...card(false), padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 130, background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)' }} />
              <div style={{ padding: '0.75rem' }}>
                <div style={{ height: 12, width: '50%', background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '0.4rem' }} />
                <div style={{ height: 14, width: '30%', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
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
              <div style={{ height: 130, background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <Image size={32} style={{ opacity: 0.2, color: '#fff' }} />}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <div style={{ color: theme.primary, fontSize: '0.7rem', fontWeight: 600 }}>{p.categoria}</div>
                <h3 style={{ color: '#fff', margin: '0.2rem 0', fontSize: '0.85rem', fontWeight: 500 }}>{p.nombre}</h3>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{fmt(p.precio)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ color: p.stock > 0 ? theme.textSecondary : theme.danger, fontSize: '0.8rem' }}>
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
              <Package size={40} style={{ opacity: 0.2, color: '#fff', marginBottom: '0.5rem' }} />
              <p style={{ color: theme.textMuted, margin: 0 }}>No has publicado productos aún</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Store
