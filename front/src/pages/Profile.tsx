import { useEffect, useState } from 'react'
import { User, Mail, Store as StoreIcon, Calendar, BadgeCheck, Shield, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { card } from '../styles'
import api from '../api/client'

const ROLE_LABELS: Record<string, { label: string; icon: typeof User }> = {
  superadmin: { label: 'Super Admin', icon: Shield },
  admin: { label: 'Admin', icon: Shield },
  vendedor: { label: 'Vendedor', icon: StoreIcon },
  cliente: { label: 'Comprador', icon: User },
  visitante: { label: 'Visitante', icon: User },
}

function Profile() {
  const { usuario } = useAuth()
  const [tiendaNombre, setTiendaNombre] = useState<string | null>(null)

  useEffect(() => {
    if (usuario?.tienda_id) {
      api.get(`/tiendas/${usuario.tienda_id}`)
        .then(r => setTiendaNombre(r.data.nombre))
        .catch(() => setTiendaNombre(null))
    }
  }, [usuario?.tienda_id])

  if (!usuario) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>Inicia sesión para ver tu perfil</p>
    </div>
  )

  const roleInfo = ROLE_LABELS[usuario.rol] || { label: usuario.rol, icon: User }
  const RoleIcon = roleInfo.icon

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', position: 'relative' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.06, pointerEvents: 'none', top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)' }} />
      <div className="animate-in" style={{ ...card(false), padding: '2rem', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ height: 100, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', margin: '-2rem -2rem 0', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '0.5rem' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--bg)', border: '4px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '-45px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={36} color="var(--primary)" />
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <h2 style={{ color: 'var(--text)', margin: '0 0 0.15rem', fontSize: '1.3rem' }}>{usuario.nombre}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>
            <RoleIcon size={16} />
            {roleInfo.label}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {[
            { icon: <Mail size={16} />, label: 'Email', value: usuario.email },
            { icon: <StoreIcon size={16} />, label: 'Tienda', value: tiendaNombre || (usuario.tienda_id ? 'Cargando...' : 'Sin tienda') },
            { icon: <Calendar size={16} />, label: 'Miembro desde', value: 'Reciente' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                {item.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.label}</div>
                <div style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{item.value}</div>
              </div>
              {item.label === 'Tienda' && tiendaNombre && (
                <Link to="/tienda" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                  <ExternalLink size={14} /> Ir
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
