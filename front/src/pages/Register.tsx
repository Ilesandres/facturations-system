import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '', tipo: 'cliente' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

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
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <ShoppingCart size={40} color="#6c63ff" />
        <h1 style={{ color: '#fff', margin: '0.5rem 0 0', fontSize: '1.5rem' }}>Crear Cuenta</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>Únete a NovaMart</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#0f0f2a', borderRadius: 12, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', borderRadius: 8, padding: '0.5rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        {(['nombre', 'email', 'password', 'telefono'] as const).map(f => (
          <div key={f} style={{ marginBottom: '0.75rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
              {f === 'telefono' ? 'Teléfono' : f.charAt(0).toUpperCase() + f.slice(1)}
            </label>
            <input type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'} value={form[f]}
              onChange={e => update(f, e.target.value)} required={f !== 'telefono'}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
          </div>
        ))}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Tipo de cuenta</label>
          <select value={form.tipo} onChange={e => update('tipo', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
            <option value="cliente">Comprador</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.7rem', borderRadius: 8, border: 'none',
          background: loading ? '#555' : '#6c63ff', color: '#fff', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
        }}>
          {loading ? 'Creando...' : 'Crear Cuenta'}
        </button>

        <p style={{ color: '#666', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#6c63ff' }}>Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
