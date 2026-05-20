import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { theme, card, inputStyle, btn } from '../styles'

const labelStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem',
  background: 'var(--primary-light)', color: 'var(--primary)',
  padding: '0.2rem 0.65rem', borderRadius: 6,
}

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
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none', top: '-30%', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)' }} />
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 8px 24px var(--primary-glow)' }}>
          <LogIn size={26} color="#fff" />
        </div>
        <h1 style={{ color: 'var(--text)', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Bienvenido de vuelta</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>Inicia sesión en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} style={{ ...card(false), padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        {error && <div style={{ color: 'var(--danger)', background: 'var(--danger-light)', borderRadius: theme.radiusSm, padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)' }}>{error}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Email
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          style={{
            ...btn('primary'), width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.9rem',
            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 14px var(--primary-glow)',
          }}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Regístrate</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
