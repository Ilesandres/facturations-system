import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Eye, EyeOff, User, Mail, Phone } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { theme, card, inputStyle } from '../styles'

const labelStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem',
  background: 'var(--primary-light)', color: 'var(--primary)',
  padding: '0.2rem 0.65rem', borderRadius: 6,
}

function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '', tipo: 'cliente' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.access_token, data.usuario)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 420, margin: '2.5rem auto', position: 'relative' }}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none', top: '-30%', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)' }} />
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 8px 24px var(--primary-glow)' }}>
          <UserPlus size={26} color="#fff" />
        </div>
        <h1 style={{ color: 'var(--text)', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Crear cuenta</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>Únete a NovaMart</p>
      </div>

      <form onSubmit={handleSubmit} style={{ ...card(false), padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        {error && <div style={{ color: 'var(--danger)', background: 'var(--danger-light)', borderRadius: theme.radiusSm, padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)' }}>{error}</div>}

        {[
          { field: 'nombre', label: 'Nombre', type: 'text', icon: <User size={14} /> },
          { field: 'email', label: 'Email', type: 'email', icon: <Mail size={14} /> },
          { field: 'telefono', label: 'Teléfono', type: 'text', icon: <Phone size={14} /> },
        ].map(({ field, label, type, icon }) => (
          <div key={field} style={{ marginBottom: '0.85rem' }}>
            <label style={labelStyle}>{icon} {label}</label>
            <input type={type} value={form[field as keyof typeof form]} onChange={e => update(field, e.target.value)} placeholder={label} style={inputStyle} required={field !== 'telefono'} />
          </div>
        ))}

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={labelStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} required placeholder="••••••••" style={inputStyle} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Tipo de cuenta</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[{ value: 'cliente', label: 'Comprador' }, { value: 'vendedor', label: 'Vendedor' }].map(opt => (
              <button key={opt.value} type="button" onClick={() => update('tipo', opt.value)} style={{
                flex: 1, padding: '0.6rem', borderRadius: theme.radiusSm, cursor: 'pointer',
                background: form.tipo === opt.value ? 'var(--primary-light)' : 'transparent',
                border: `1px solid ${form.tipo === opt.value ? 'var(--border-hover)' : 'var(--border)'}`,
                color: form.tipo === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: form.tipo === opt.value ? 600 : 400, fontSize: '0.85rem',
                transition: 'all var(--transition)',
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          style={{
            width: '100%', padding: '0.7rem', borderRadius: theme.radiusSm, border: 'none',
            background: loading ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem', opacity: loading ? 0.6 : 1,
            boxShadow: loading ? 'none' : '0 4px 14px var(--primary-glow)',
            transition: 'all var(--transition)',
          }}>
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
