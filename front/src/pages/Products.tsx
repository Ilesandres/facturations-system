import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package, SlidersHorizontal, X } from 'lucide-react'
import type { Producto, Categoria } from '../types'
import { getProductos } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { card, cardHover, fmt } from '../styles'

function Products() {
  const [searchParams] = useSearchParams()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [search,] = useState(searchParams.get('search') || '')
  const [categoriaId, setCategoriaId] = useState(searchParams.get('categoria_id') || '')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (categoriaId) params.categoria_id = categoriaId
    if (search) params.search = search
    Promise.all([
      getProductos(params).then(setProductos),
      getCategorias().then(r => setCategorias(r.items)),
    ]).finally(() => setLoading(false))
  }, [categoriaId, search])

  const currentCat = categorias.find(c => c.id === categoriaId)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
          {currentCat?.nombre || 'Todos los productos'}
          {search && <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.9rem' }}> · "{search}"</span>}
        </h2>
        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: showFilters ? 'var(--primary-light)' : 'transparent',
          border: `1px solid ${showFilters ? 'var(--border-hover)' : 'var(--border)'}`,
          borderRadius: 50, padding: '0.45rem 1rem', cursor: 'pointer',
          color: showFilters ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.85rem',
          transition: 'all var(--transition)', fontWeight: 500,
        }}>
          <SlidersHorizontal size={15} /> Filtros
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {showFilters && (
          <aside className="animate-in" style={{ width: 220, flexShrink: 0 }}>
            <div style={{ ...card(false), padding: '1rem', position: 'sticky', top: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ color: 'var(--text)', margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Categorías</h3>
                {categoriaId && <button onClick={() => setCategoriaId('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>}
              </div>
              <button onClick={() => setCategoriaId('')} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '0.45rem 0.7rem',
                background: !categoriaId ? 'var(--primary-light)' : 'transparent',
                border: 'none', borderRadius: 8, color: !categoriaId ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: !categoriaId ? 600 : 400,
                transition: 'background var(--transition)',
              }}>Todas</button>
              {categorias.map(c => (
                <button key={c.id} onClick={() => setCategoriaId(c.id)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.45rem 0.7rem',
                  background: categoriaId === c.id ? 'var(--primary-light)' : 'transparent',
                  border: 'none', borderRadius: 8, color: categoriaId === c.id ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: categoriaId === c.id ? 600 : 400,
                  transition: 'background var(--transition)',
                }}>{c.nombre}</button>
              ))}
            </div>
          </aside>
        )}

        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ ...card(false), padding: 0, overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 150 }} />
                  <div style={{ padding: '0.85rem' }}>
                    <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${showFilters ? '180px' : '200px'}, 1fr))`, gap: '1rem' }}>
              {productos.map((p, i) => (
                <ProductItem key={p.id} p={p} i={i} />
              ))}
              {productos.length === 0 && (
                <div style={{ ...card(false), gridColumn: '1 / -1', padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <Package size={48} style={{ opacity: 0.12, color: 'var(--text)', marginBottom: '0.75rem' }} />
                  <h3 style={{ color: 'var(--text)', margin: '0 0 0.3rem', fontSize: '1.1rem' }}>No se encontraron productos</h3>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Intenta ajustar los filtros</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductItem({ p, i }: { p: Producto; i: number }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={`/productos/${p.id}`}
      className={`animate-in animate-in-d${(i % 6) + 1}`}
      style={{ textDecoration: 'none', ...card(), ...(hover ? cardHover : {}), overflow: 'hidden' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--bg-card-hover), var(--bg-card))',
      }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hover ? 'scale(1.08)' : 'scale(1)' }} />
        ) : <Package size={36} style={{ opacity: 0.15, color: 'var(--text)' }} />}
      </div>
      <div style={{ padding: '0.75rem' }}>
        <h3 style={{ color: 'var(--text)', margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>{p.nombre}</h3>
        <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(p.precio)}</div>
      </div>
    </Link>
  )
}

export default Products
