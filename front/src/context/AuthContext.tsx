import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import api from '../api/client'

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  avatar_url: string
  tienda_id: string
}

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me').then(r => setUsuario(r.data)).catch(() => logout()).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function login(newToken: string, newUsuario: Usuario) {
    localStorage.setItem('token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUsuario(newUsuario)
  }

  function logout() {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, token, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
