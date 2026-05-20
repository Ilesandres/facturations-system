import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <ShoppingCart size={40} color="#6c63ff" />
        <h1 style={{ color: '#fff', margin: '0.5rem 0 0', fontSize: '1.5rem' }}>Iniciar Sesión</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Bienvenido de vuelta</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#0f0f2a', borderRadius: 12, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.7rem', borderRadius: 8, border: 'none',
          background: loading ? '#555' : '#6c63ff', color: '#fff', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
        }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: '#6c63ff' }}>Regístrate</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
