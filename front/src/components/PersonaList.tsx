import { useEffect, useState } from 'react'
import type { Persona } from '../types'
import { getPersonas, createPersona, deletePersona } from '../api/personas'

function PersonaList() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setPersonas(await getPersonas()) }
    finally { setLoading(false) }
  }

  async function handleCreate() {
    const nombre = prompt('Nombre:')?.trim()
    if (!nombre) return
    const email = prompt('Email:')?.trim() || `${nombre}@email.com`
    const telefono = prompt('Teléfono:')?.trim() || '0000000000'
    const latitud = parseFloat(prompt('Latitud:', '4.7110') || '4.7110')
    const longitud = parseFloat(prompt('Longitud:', '-74.0721') || '-74.0721')
    await createPersona({
      nombre, email, telefono,
      ubicacion: { latitud, longitud, direccion: '', ciudad: '', pais: '' },
      tipo: 'cliente',
    })
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar persona?')) return
    await deletePersona(id)
    await load()
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Personas (Cassandra)</h2>
        <button onClick={handleCreate} style={btnStyle}>+ Nueva Persona</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
        <thead>
          <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Teléfono</th>
            <th style={thStyle}>Ubicación</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personas.map(p => (
            <tr key={p.id} style={{ borderTop: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>{p.nombre}</td>
              <td style={tdStyle}>{p.email}</td>
              <td style={tdStyle}>{p.telefono}</td>
              <td style={tdStyle}>{p.ubicacion.latitud.toFixed(4)}, {p.ubicacion.longitud.toFixed(4)}</td>
              <td style={tdStyle}>
                <button onClick={() => handleDelete(p.id)} style={{ ...btnStyle, background: '#ef4444' }}>Eliminar</button>
              </td>
            </tr>
          ))}
          {personas.length === 0 && (
            <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>Sin personas registradas</td></tr>
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

export default PersonaList
