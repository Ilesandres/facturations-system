import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Package, SlidersHorizontal, X } from 'lucide-react'
import type { Producto } from '../types'
import { getProductos } from '../api/productos'
import { getCategorias } from '../api/categorias'
import { theme, card, cardHover, fmt } from '../styles'

function Products() {
  const [searchParams] = useSearchParams()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (categoria) params.categoria = categoria
    if (search) params.search = search
    Promise.all([
      getProductos(params).then(setProductos),
      getCategorias().then(setCategorias),
    ]).finally(() => setLoading(false))
  }, [categoria, search])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
          {categoria || 'Todos los productos'}
          {search && <span style={{ color: theme.textSecondary, fontWeight: 400, fontSize: '0.9rem' }}> · "{search}"</span>}
        </h2>
        <button onClick={() => setShowFilters(!showFilters)} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: showFilters ? theme.primaryLight : 'transparent',
          border: `1px solid ${showFilters ? theme.borderHover : theme.border}`,
          borderRadius: theme.radiusSm, padding: '0.45rem 0.9rem', cursor: 'pointer',
          color: showFilters ? theme.primary : theme.textSecondary, fontSize: '0.85rem',
          transition: `all ${theme.transition}`,
        }}>
          <SlidersHorizontal size={15} /> Filtros
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Filters sidebar */}
        {showFilters && (
          <aside style={{ width: 220, flexShrink: 0 }}>
            <div style={{ ...card(false), padding: '1rem', position: 'sticky', top: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '0.9rem' }}>Categorías</h3>
                {categoria && <button onClick={() => setCategoria('')} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer' }}><X size={14} /></button>}
              </div>
              <button onClick={() => setCategoria('')} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.6rem',
                background: !categoria ? theme.primaryLight : 'transparent',
                border: 'none', borderRadius: 6, color: !categoria ? theme.primary : theme.textSecondary,
                cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.2rem',
                transition: `background ${theme.transition}`,
              }}>Todas</button>
              {categorias.map(c => (
                <button key={c} onClick={() => setCategoria(c)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.6rem',
                  background: categoria === c ? theme.primaryLight : 'transparent',
                  border: 'none', borderRadius: 6, color: categoria === c ? theme.primary : theme.textSecondary,
                  cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.2rem',
                  transition: `background ${theme.transition}`,
                }}>{c}</button>
              ))}
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ ...card(false), padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 150, background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)' }} />
                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '0.5rem' }} />
                    <div style={{ height: 16, width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${showFilters ? '180px' : '200px'}, 1fr))`, gap: '1rem' }}>
              {productos.map(p => (
                <ProductItem key={p.id} p={p} />
              ))}
              {productos.length === 0 && (
                <div style={{ ...card(false), gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                  <Package size={40} style={{ opacity: 0.2, color: '#fff', marginBottom: '0.5rem' }} />
                  <p style={{ color: theme.textMuted, margin: 0 }}>No se encontraron productos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductItem({ p }: { p: Producto }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={`/productos/${p.id}`}
      style={{ textDecoration: 'none', ...card(), ...(hover ? cardHover : {}), overflow: 'hidden' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ height: 150, background: 'linear-gradient(135deg, #1a1a3e 0%, #12122a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: `transform 0.4s`, transform: hover ? 'scale(1.08)' : 'scale(1)' }} />
        ) : <Package size={36} style={{ opacity: 0.2, color: '#fff' }} />}
      </div>
      <div style={{ padding: '0.75rem' }}>
        <div style={{ color: theme.primary, fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.2rem' }}>{p.categoria}</div>
        <h3 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.3 }}>{p.nombre}</h3>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(p.precio)}</div>
      </div>
    </Link>
  )
}

export default Products
