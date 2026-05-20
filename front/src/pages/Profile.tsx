import { User, Mail, Phone, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { usuario } = useAuth()

  if (!usuario) return <p style={{ color: '#666' }}>Inicia sesión para ver tu perfil</p>

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <div style={{ background: '#0f0f2a', borderRadius: 16, padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          {usuario.avatar_url ? (
            <img src={usuario.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <User size={36} color="#6c63ff" />
          )}
        </div>
        <h2 style={{ color: '#fff', margin: '0 0 0.25rem' }}>{usuario.nombre}</h2>
        <div style={{ color: '#6c63ff', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {usuario.tipo === 'vendedor' ? 'Vendedor' : 'Comprador'}
        </div>

        <div style={{ textAlign: 'left' }}>
          {[
            { icon: <Mail size={16} />, label: 'Email', value: usuario.email },
            { icon: <Store size={16} />, label: 'Tienda ID', value: usuario.tienda_id || 'Sin tienda' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#6c63ff' }}>{item.icon}</span>
              <div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>{item.label}</div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
