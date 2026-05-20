import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PersonaList from './components/PersonaList'
import ProductoList from './components/ProductoList'
import VentaList from './components/VentaList'
import RecomendacionList from './components/RecomendacionList'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/personas" replace />} />
        <Route path="/personas" element={<PersonaList />} />
        <Route path="/productos" element={<ProductoList />} />
        <Route path="/ventas" element={<VentaList />} />
        <Route path="/recomendaciones" element={<RecomendacionList />} />
      </Route>
    </Routes>
  )
}

export default App
