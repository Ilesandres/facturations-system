import { useState } from 'react'
import type { Recomendacion } from '../types'
import api from '../api/client'
import { getPersonas } from '../api/personas'

function RecomendacionList() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([])
  const [loading, setLoading] = useState(false)
  const [consultado, setConsultado] = useState(false)

  async function handleSearch() {
    const personas = await getPersonas()
    if (personas.length === 0) { alert('Primero crea personas'); return }

    const personaId = prompt(`ID Persona de referencia (ej: ${personas[0].id}):`) || personas[0].id
    const radioKm = parseFloat(prompt('Radio (km):', '10') || '10')

    setLoading(true)
    setConsultado(true)
    try {
      const { data } = await api.get<Recomendacion[]>(`/recomendaciones/${personaId}`, { params: { radio_km: radioKm } })
      setRecomendaciones(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Recomendaciones (Neo4j)</h2>
        <button onClick={handleSearch} disabled={loading} style={btnStyle}>
          {loading ? 'Buscando...' : 'Buscar Recomendaciones'}
        </button>
      </div>

      {consultado && recomendaciones.length === 0 && !loading && (
        <p style={{ color: '#9ca3af' }}>No se encontraron clientes cercanos</p>
      )}

      {recomendaciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Distancia (km)</th>
              <th style={thStyle}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {recomendaciones.map(r => (
              <tr key={r.persona_id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={tdStyle}>{r.nombre}</td>
                <td style={tdStyle}>{r.email}</td>
                <td style={tdStyle}>{r.distancia_km.toFixed(2)}</td>
                <td style={tdStyle}>{r.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!consultado && !loading && (
        <p style={{ color: '#9ca3af' }}>Presiona "Buscar Recomendaciones" para encontrar clientes cercanos vía Neo4j</p>
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

export default RecomendacionList
