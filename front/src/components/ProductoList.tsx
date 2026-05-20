import { useEffect, useState } from 'react'
import type { Producto } from '../types'
import { getProductos, createProducto, deleteProducto } from '../api/productos'

function ProductoList() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setProductos(await getProductos()) }
    finally { setLoading(false) }
  }

  async function handleCreate() {
    const nombre = prompt('Nombre:')?.trim()
    if (!nombre) return
    const precio = parseFloat(prompt('Precio:', '10000') || '10000')
    const stock = parseInt(prompt('Stock:', '10') || '10', 10)
    const categoria_id = prompt('Categoría ID:')?.trim() || ''
    await createProducto({ nombre, descripcion: '', precio, moneda: 'COP', stock, categoria_id, image_url: '' })
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar producto?')) return
    await deleteProducto(id)
    await load()
  }

  if (loading) return <p>Cargando...</p>

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Productos (MongoDB)</h2>
        <button onClick={handleCreate} style={btnStyle}>+ Nuevo Producto</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
        <thead>
          <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Precio</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>{p.nombre}</td>
              <td style={tdStyle}>{fmt(p.precio)}</td>
              <td style={tdStyle}>{p.stock}</td>
              <td style={tdStyle}>
                <button onClick={() => handleDelete(p.id)} style={{ ...btnStyle, background: '#ef4444' }}>Eliminar</button>
              </td>
            </tr>
          ))}
          {productos.length === 0 && (
            <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>Sin productos registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.75rem', fontWeight: 600 }
const tdStyle: React.CSSProperties = { padding: '0.75rem' }
const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', border: 'none', borderRadius: 6, color: '#fff',
  background: '#2563eb', cursor: 'pointer', fontSize: '0.875rem',
}

export default ProductoList
