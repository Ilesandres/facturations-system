import { Shield, Users, Store, Package, Database } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { card } from '../styles'

function Admin() {
  const { usuario } = useAuth()

  if (!usuario || !['admin', 'superadmin'].includes(usuario.rol)) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>No tienes acceso a esta sección</p>
    </div>
  )

  const cards = [
    { icon: <Users size={22} />, label: 'Usuarios', desc: 'Gestionar usuarios y roles' },
    { icon: <Store size={22} />, label: 'Tiendas', desc: 'Administrar tiendas' },
    { icon: <Package size={22} />, label: 'Productos', desc: 'Ver todos los productos' },
    { icon: <Database size={22} />, label: 'Base de Datos', desc: 'Estado de conexiones' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
          <Shield size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Panel de Administración</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0 0', fontSize: '0.85rem' }}>
            {usuario.rol === 'superadmin' ? 'Super Admin' : 'Admin'} — {usuario.nombre}
          </p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...card(false), padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'var(--primary)' }}>{c.icon}</div>
            <h3 style={{ color: 'var(--text)', margin: '0 0 0.3rem', fontSize: '1rem' }}>{c.label}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Admin
