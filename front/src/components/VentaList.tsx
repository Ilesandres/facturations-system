import { useState } from 'react'
import type { Venta } from '../types'
import { createVenta, getVenta } from '../api/ventas'
import { getPersonas } from '../api/personas'
import { getProductos } from '../api/productos'

function VentaList() {
  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    const personas = await getPersonas()
    if (personas.length === 0) { alert('Primero crea una persona'); return }
    const productos = await getProductos()
    if (productos.length === 0) { alert('Primero crea un producto'); return }

    const personaId = prompt(`ID Persona (ej: ${personas[0].id}):`) || personas[0].id
    const prodId = prompt(`ID Producto (ej: ${productos[0].id}):`) || productos[0].id
    const cantidad = parseInt(prompt('Cantidad:', '1') || '1', 10)

    setLoading(true)
    try {
      const result = await createVenta({ persona_id: personaId, items: [{ producto_id: prodId, cantidad }] })
      setVenta(result)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Ventas (MySQL)</h2>
        <button onClick={handleCreate} disabled={loading} style={btnStyle}>
          {loading ? 'Creando...' : '+ Nueva Venta'}
        </button>
      </div>

      {venta && (
        <div style={{ background: '#fff', borderRadius: 8, padding: '1rem' }}>
          <h3>Factura #{venta.id.slice(0, 8)}</h3>
          <p><strong>Persona:</strong> {venta.persona_id}</p>
          <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString('es-CO')}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Cantidad</th>
                <th style={thStyle}>Precio Unit.</th>
                <th style={thStyle}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map(d => (
                <tr key={d.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{d.nombre_producto}</td>
                  <td style={tdStyle}>{d.cantidad}</td>
                  <td style={tdStyle}>{fmt(d.precio_unitario)}</td>
                  <td style={tdStyle}>{fmt(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan={3} style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>Total</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(venta.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!venta && !loading && (
        <p style={{ color: '#9ca3af' }}>Presiona "+ Nueva Venta" para generar una factura</p>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = { padding: '0.75rem', fontWeight: 600 }
const tdStyle: React.CSSProperties = { padding: '0.75rem' }
const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem', border: 'none', borderRadius: 6, color: '#fff',
  background: '#2563eb', cursor: 'pointer', fontSize: '0.875rem',
}

export default VentaList
