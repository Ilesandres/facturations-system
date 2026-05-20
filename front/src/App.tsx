import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Store from './pages/Store'
import Admin from './pages/Admin'
import Recommendations from './pages/Recommendations'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'var(--transition)' }}>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem', animation: 'fadeInUp 0.4s ease' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/tienda" element={<Store />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/recomendaciones" element={<Recommendations />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
