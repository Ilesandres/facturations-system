import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye, EyeOff } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { theme, card, input, glowBg } from '../styles'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.access_token, data.usuario)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 420, margin: '2.5rem auto', position: 'relative' }}>
      <div style={{ ...glowBg, top: '-30%', left: '50%', transform: 'translateX(-50%)', background: theme.primary }} />
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: `0 8px 24px ${theme.primaryGlow}` }}>
          <ShoppingCart size={24} color="#fff" />
        </div>
        <h1 style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Bienvenido de vuelta</h1>
        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: '0.3rem 0 0' }}>Inicia sesión en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} style={{ ...card(false), padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        {error && <div style={{ color: theme.danger, background: `${theme.danger}15`, borderRadius: theme.radiusSm, padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', border: `1px solid ${theme.danger}30` }}>{error}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" style={input} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: theme.textSecondary, fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={input} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.7rem', borderRadius: theme.radiusSm, border: 'none',
          background: loading ? theme.textMuted : `linear-gradient(135deg, ${theme.primary}, #8b5cf6)`,
          color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem', boxShadow: loading ? 'none' : `0 4px 14px ${theme.primaryGlow}`,
          transition: `all ${theme.transition}`,
        }}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p style={{ color: theme.textMuted, fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: theme.primary, fontWeight: 500, textDecoration: 'none' }}>Regístrate</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
