import { useEffect, useState } from 'react'
import { Plus, Package, Trash2 } from 'lucide-react'
import type { Producto } from '../types'
import { getProductos, createProducto, deleteProducto } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { useAuth } from '../context/AuthContext'

function Store() {
  const { usuario } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', image_url: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    setLoading(true)
    Promise.all([
      getProductos({ vendedor_id: usuario.id }).then(setProductos),
      getCategorias().then(setCategorias),
    ]).finally(() => setLoading(false))
  }, [usuario])

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createProducto({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        moneda: 'COP',
        stock: parseInt(form.stock || '0'),
        categoria: form.categoria || 'General',
        image_url: form.image_url,
      })
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', image_url: '' })
      const updated = await getProductos({ vendedor_id: usuario!.id })
      setProductos(updated)
    } catch { alert('Error al crear producto') }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar producto?')) return
    try {
      await deleteProducto(id)
      setProductos(prev => prev.filter(p => p.id !== id))
    } catch { alert('Error al eliminar') }
  }

  if (!usuario) return <p style={{ color: '#666' }}>Inicia sesión para gestionar tu tienda</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>Mi Tienda</h2>
          <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{productos.length} productos publicados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: '#6c63ff', color: '#fff', border: 'none',
          borderRadius: 8, padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600,
        }}>
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#0f0f2a', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { field: 'nombre', label: 'Nombre', type: 'text' },
              { field: 'precio', label: 'Precio', type: 'number' },
              { field: 'stock', label: 'Stock', type: 'number' },
              { field: 'categoria', label: 'Categoría', type: 'select', options: categorias },
              { field: 'image_url', label: 'URL de Imagen', type: 'text' },
            ].map(({ field, label, type, options }) => (
              <div key={field}>
                <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
                {type === 'select' ? (
                  <select value={form[field as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    style={inputStyle}>
                    <option value="">Seleccionar</option>
                    {options?.map(o => <option key={o} value={o}>{o}</option>)}
                    <option value="Nueva">+ Nueva</option>
                  </select>
                ) : (
                  <input type={type} value={form[field as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    style={inputStyle} required={field !== 'image_url'} />
                )}
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                style={{ ...inputStyle, minHeight: 60 }} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: '1rem', background: '#6c63ff', color: '#fff', border: 'none',
            borderRadius: 8, padding: '0.6rem 1.5rem', cursor: 'pointer', fontWeight: 600,
          }}>Publicar Producto</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {productos.map(p => (
            <div key={p.id} style={{ background: '#0f0f2a', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ height: 130, background: '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Package size={32} style={{ opacity: 0.3, color: '#fff' }} />}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <div style={{ color: '#6c63ff', fontSize: '0.7rem' }}>{p.categoria}</div>
                <h3 style={{ color: '#fff', margin: '0.2rem 0', fontSize: '0.85rem', fontWeight: 500 }}>{p.nombre}</h3>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{fmt(p.precio)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>Stock: {p.stock}</span>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {productos.length === 0 && (
            <p style={{ color: '#555', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              No has publicado productos aún
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
}

export default Store
