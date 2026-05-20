import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye, EyeOff } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { theme, card, input, glowBg } from '../styles'

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
      <div style={{ ...glowBg, top: '-30%', left: '50%', transform: 'translateX(-50%)', background: theme.primary }} />
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: `0 8px 24px ${theme.primaryGlow}` }}>
          <ShoppingCart size={24} color="#fff" />
        </div>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Crear cuenta</h1>
        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: '0.3rem 0 0' }}>Únete a NovaMart</p>
      </div>

      <form onSubmit={handleSubmit} style={{ ...card(false), padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        {error && <div style={{ color: theme.danger, background: `${theme.danger}15`, borderRadius: theme.radiusSm, padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', border: `1px solid ${theme.danger}30` }}>{error}</div>}

        {[
          { field: 'nombre', label: 'Nombre', type: 'text' },
          { field: 'email', label: 'Email', type: 'email' },
          { field: 'telefono', label: 'Teléfono', type: 'text' },
        ].map(({ field, label, type }) => (
          <div key={field} style={{ marginBottom: '0.85rem' }}>
            <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>{label}</label>
            <input type={type} value={form[field as keyof typeof form]} onChange={e => update(field, e.target.value)} placeholder={label} style={input} required={field !== 'telefono'} />
          </div>
        ))}

        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} required placeholder="••••••••" style={input} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Tipo de cuenta</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[{ value: 'cliente', label: 'Comprador' }, { value: 'vendedor', label: 'Vendedor' }].map(opt => (
              <button key={opt.value} type="button" onClick={() => update('tipo', opt.value)} style={{
                flex: 1, padding: '0.55rem', borderRadius: theme.radiusSm, cursor: 'pointer',
                background: form.tipo === opt.value ? theme.primaryLight : 'transparent',
                border: `1px solid ${form.tipo === opt.value ? theme.borderHover : theme.border}`,
                color: form.tipo === opt.value ? theme.primary : theme.textSecondary,
                fontWeight: form.tipo === opt.value ? 600 : 400, fontSize: '0.85rem',
                transition: `all ${theme.transition}`,
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.7rem', borderRadius: theme.radiusSm, border: 'none',
          background: loading ? theme.textMuted : `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`,
          color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem', boxShadow: loading ? 'none' : `0 4px 14px ${theme.primaryGlow}`,
          transition: `all ${theme.transition}`,
        }}>
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>

        <p style={{ color: theme.textMuted, fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: theme.primary, fontWeight: 500, textDecoration: 'none' }}>Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
