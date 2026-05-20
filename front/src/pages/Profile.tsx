import { User, Mail, Store as StoreIcon, Calendar, BadgeCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { theme, card, glowBg } from '../styles'

function Profile() {
  const { usuario } = useAuth()

  if (!usuario) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: theme.textMuted }}>Inicia sesión para ver tu perfil</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', position: 'relative' }}>
      <div style={{ ...glowBg, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: theme.primary }} />
      <div style={{ ...card(false), padding: '2rem', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ height: 80, background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`, margin: '-2rem -2rem 0', position: 'relative' }} />
        <div style={{ textAlign: 'center', marginTop: '-40px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: theme.bgCard, border: `3px solid ${theme.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', overflow: 'hidden' }}>
            {usuario.avatar_url ? (
              <img src={usuario.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={32} color={theme.primary} />
              </div>
            )}
          </div>
          <h2 style={{ color: '#fff', margin: '0 0 0.15rem', fontSize: '1.3rem' }}>{usuario.nombre}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: theme.primary, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <BadgeCheck size={16} />
            {usuario.tipo === 'vendedor' ? 'Vendedor' : 'Comprador'}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '1rem' }}>
          {[
            { icon: <Mail size={16} />, label: 'Email', value: usuario.email },
            { icon: <StoreIcon size={16} />, label: 'Tienda', value: usuario.tienda_id ? `ID: ${usuario.tienda_id.slice(0, 8)}...` : 'Sin tienda' },
            { icon: <Calendar size={16} />, label: 'Miembro desde', value: 'Reciente' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: theme.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary, flexShrink: 0 }}>
                {item.icon}
              </span>
              <div>
                <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>{item.label}</div>
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
