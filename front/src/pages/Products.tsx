import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { Producto } from '../types'
import { getProductos } from '../api/productos'
import { getCategorias } from '../api/categorias'

function Products() {
  const [searchParams] = useSearchParams()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '')

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (categoria) params.categoria = categoria
    if (search) params.search = search
    const qs = new URLSearchParams(params).toString()
    Promise.all([
      getProductos(qs ? Object.fromEntries(new URLSearchParams(qs)) : {}).then(setProductos),
      getCategorias().then(setCategorias),
    ]).finally(() => setLoading(false))
  }, [categoria, search])

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: '#0f0f2a', borderRadius: 12, padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: '5rem' }}>
            <h3 style={{ color: '#fff', margin: '0 0 0.75rem', fontSize: '0.9rem' }}>Categorías</h3>
            <button onClick={() => setCategoria('')} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem',
              background: !categoria ? 'rgba(108,99,255,0.15)' : 'transparent',
              border: 'none', borderRadius: 6, color: !categoria ? '#6c63ff' : '#aaa',
              cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.25rem',
            }}>Todas</button>
            {categorias.map(c => (
              <button key={c} onClick={() => setCategoria(c)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.5rem',
                background: categoria === c ? 'rgba(108,99,255,0.15)' : 'transparent',
                border: 'none', borderRadius: 6, color: categoria === c ? '#6c63ff' : '#aaa',
                cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.25rem',
              }}>{c}</button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>
              {categoria || 'Todos los productos'}
            </h2>
          </div>

          {loading ? (
            <p style={{ color: '#666' }}>Cargando...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {productos.map(p => (
                <Link key={p.id} to={`/productos/${p.id}`} style={{
                  textDecoration: 'none', background: '#0f0f2a', borderRadius: 12, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s',
                }}>
                  <div style={{ height: 150, background: '#1a1a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>📦</span>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ color: '#6c63ff', fontSize: '0.7rem', marginBottom: '0.2rem' }}>{p.categoria}</div>
                    <h3 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 500 }}>{p.nombre}</h3>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{fmt(p.precio)}</div>
                  </div>
                </Link>
              ))}
              {productos.length === 0 && (
                <p style={{ color: '#555', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                  No se encontraron productos
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
