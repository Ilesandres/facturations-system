import { useState, useEffect, useCallback } from 'react'
import { Shield, Users, Store, Package, RefreshCw, Trash2, RotateCcw, UserCog, Activity, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { card, theme, btn } from '../styles'
import {
  getAdminStats, getUsers, updateUserRol, deleteUser,
  getInactiveUsers, reactivateUser,
  getDeletedProducts, restoreProduct,
  getDeletedTiendas, restoreTienda,
  getDeletedCategorias, restoreCategoria,
  syncNeo4j,
} from '../api/admin'
import type { AdminStats, Usuario, Producto, Categoria } from '../types'

interface TiendaResponse {
  id: string; nombre: string; vendedor_id: string
  descripcion: string; avatar_url: string; telefono: string; direccion: string
}

type Tab = 'stats' | 'usuarios' | 'inactivos' | 'productos' | 'tiendas' | 'categorias'

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin', admin: 'Admin', vendedor: 'Vendedor', cliente: 'Comprador', visitante: 'Visitante',
}

function Admin() {
  const { usuario } = useAuth()
  const [tab, setTab] = useState<Tab>('stats')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<Usuario[]>([])
  const [inactiveUsers, setInactiveUsers] = useState<Usuario[]>([])
  const [deletedProds, setDeletedProds] = useState<Producto[]>([])
  const [deletedTiendas, setDeletedTiendas] = useState<TiendaResponse[]>([])
  const [deletedCats, setDeletedCats] = useState<Categoria[]>([])
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }, [])

  const fetchStats = useCallback(async () => {
    try { setStats(await getAdminStats()) } catch { showMsg('error', 'Error al cargar estadísticas') }
  }, [showMsg])

  const fetchUsers = useCallback(async () => {
    try { setUsers(await getUsers()) } catch { showMsg('error', 'Error al cargar usuarios') }
  }, [showMsg])

  const fetchInactiveUsers = useCallback(async () => {
    try { setInactiveUsers(await getInactiveUsers()) } catch { showMsg('error', 'Error al cargar usuarios inactivos') }
  }, [showMsg])

  const fetchDeletedProds = useCallback(async () => {
    try { setDeletedProds(await getDeletedProducts()) } catch { showMsg('error', 'Error al cargar productos eliminados') }
  }, [showMsg])

  const fetchDeletedTiendas = useCallback(async () => {
    try { setDeletedTiendas(await getDeletedTiendas()) } catch { showMsg('error', 'Error al cargar tiendas eliminadas') }
  }, [showMsg])

  const fetchDeletedCats = useCallback(async () => {
    try { setDeletedCats(await getDeletedCategorias()) } catch { showMsg('error', 'Error al cargar categorías eliminadas') }
  }, [showMsg])

  useEffect(() => { if (usuario && ['admin', 'superadmin'].includes(usuario.rol)) fetchStats() }, [fetchStats, usuario])

  const handleChangeRol = async (userId: string, newRol: string) => {
    try {
      await updateUserRol(userId, newRol)
      showMsg('success', 'Rol actualizado')
      fetchUsers()
    } catch { showMsg('error', 'Error al cambiar rol') }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
      await deleteUser(userId)
      showMsg('success', 'Usuario eliminado')
      fetchUsers()
      fetchStats()
    } catch { showMsg('error', 'Error al eliminar usuario') }
  }

  const handleReactivateUser = async (userId: string) => {
    try {
      await reactivateUser(userId)
      showMsg('success', 'Usuario reactivado')
      fetchInactiveUsers()
      fetchStats()
      fetchUsers()
    } catch { showMsg('error', 'Error al reactivar usuario') }
  }

  const handleRestore = async (type: 'producto' | 'tienda' | 'categoria', id: string) => {
    try {
      if (type === 'producto') await restoreProduct(id)
      else if (type === 'tienda') await restoreTienda(id)
      else await restoreCategoria(id)
      showMsg('success', `${type.charAt(0).toUpperCase() + type.slice(1)} restaurado`)
      if (type === 'producto') { fetchDeletedProds(); fetchStats() }
      else if (type === 'tienda') { fetchDeletedTiendas(); fetchStats() }
      else { fetchDeletedCats(); fetchStats() }
    } catch { showMsg('error', `Error al restaurar ${type}`) }
  }

  if (!usuario || !['admin', 'superadmin'].includes(usuario.rol)) return (
    <div style={{ ...card(false), padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>No tienes acceso a esta sección</p>
    </div>
  )

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'stats', icon: <Activity size={16} />, label: 'Dashboard' },
    { key: 'usuarios', icon: <Users size={16} />, label: 'Usuarios' },
    { key: 'inactivos', icon: <Users size={16} />, label: 'Usuarios Inactivos' },
    { key: 'productos', icon: <Package size={16} />, label: 'Productos Eliminados' },
    { key: 'tiendas', icon: <Store size={16} />, label: 'Tiendas Eliminadas' },
    { key: 'categorias', icon: <Package size={16} />, label: 'Categorías Eliminadas' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
          <Shield size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ color: 'var(--text)', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Panel de Administración</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.1rem 0 0', fontSize: '0.85rem' }}>
            {ROLE_LABELS[usuario.rol] || usuario.rol} — {usuario.nombre}
          </p>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '0.65rem 1rem', borderRadius: theme.radiusSm, marginBottom: '1rem', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: msg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
        }}>
          {msg.type === 'success' ? <Activity size={16} /> : <AlertCircle size={16} />}
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={16} /></button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              ...btn('ghost'), padding: '0.45rem 0.85rem', fontSize: '0.82rem',
              background: tab === t.key ? 'var(--primary-light)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              borderColor: tab === t.key ? 'var(--primary)' : 'var(--border)',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <StatsView stats={stats} onRefresh={fetchStats} />
      )}
      {tab === 'usuarios' && (
        <UsersView
          users={users} currentUserId={usuario.id} currentRol={usuario.rol}
          onFetch={fetchUsers} onChangeRol={handleChangeRol} onDelete={handleDeleteUser}
        />
      )}
      {tab === 'inactivos' && (
        <InactiveUsersView
          users={inactiveUsers} onFetch={fetchInactiveUsers} onReactivate={handleReactivateUser}
        />
      )}
      {tab === 'productos' && (
        <DeletedView
          title="Productos Eliminados"
          items={deletedProds}
          onFetch={fetchDeletedProds}
          onRestore={(id) => handleRestore('producto', id)}
          renderItem={(p) => <span>{p.nombre} — ${p.precio}</span>}
        />
      )}
      {tab === 'tiendas' && (
        <DeletedView
          title="Tiendas Eliminadas"
          items={deletedTiendas}
          onFetch={fetchDeletedTiendas}
          onRestore={(id) => handleRestore('tienda', id)}
          renderItem={(t) => <span>{t.nombre} — {t.direccion}</span>}
        />
      )}
      {tab === 'categorias' && (
        <DeletedView
          title="Categorías Eliminadas"
          items={deletedCats}
          onFetch={fetchDeletedCats}
          onRestore={(id) => handleRestore('categoria', id)}
          renderItem={(c) => <span>{c.nombre} — {c.descripcion}</span>}
        />
      )}
    </div>
  )
}

function StatsView({ stats, onRefresh }: { stats: AdminStats | null; onRefresh: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await syncNeo4j()
      setSyncMsg(`Sincronizados: ${res.synced}, errores: ${res.errors}`)
      onRefresh()
    } catch { setSyncMsg('Error al sincronizar') }
    setSyncing(false)
  }
  const cards = stats ? [
    { label: 'Productos', value: stats.productos_activos, color: '#8b5cf6', icon: <Package size={22} /> },
    { label: 'Categorías', value: stats.categorias_activas, color: '#06b6d4', icon: <Package size={22} /> },
    { label: 'Usuarios', value: stats.usuarios_activos, color: '#22c55e', icon: <Users size={22} /> },
    { label: 'Tiendas', value: stats.tiendas_activas, color: '#f59e0b', icon: <Store size={22} /> },
    { label: 'Personas', value: stats.personas_activas, color: '#ec4899', icon: <Users size={22} /> },
    { label: 'Ventas', value: stats.ventas, color: '#ef4444', icon: <Activity size={22} /> },
  ] : []

  return (
    <div>
      {syncMsg && <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--success)' }}>{syncMsg}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Resumen del Sistema</h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleSync} disabled={syncing} style={{ ...btn('ghost'), padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: syncing ? 0.6 : 1 }}>
            <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} /> {syncing ? 'Sincronizando...' : 'Sync Neo4j'}
          </button>
          <button onClick={onRefresh} style={{ ...btn('ghost'), padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.8rem' }}>
          {cards.map(c => (
            <div key={c.label} style={{ ...card(false), padding: '1.2rem', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>{c.value}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Cargando estadísticas...</p>
      )}
    </div>
  )
}

function UsersView({
  users, currentUserId, currentRol, onFetch, onChangeRol, onDelete,
}: {
  users: Usuario[]; currentUserId: string; currentRol: string
  onFetch: () => void; onChangeRol: (id: string, rol: string) => Promise<void>; onDelete: (id: string) => Promise<void>
}) {
  const [editingRol, setEditingRol] = useState<string | null>(null)
  const [selectedRol, setSelectedRol] = useState('')

  useEffect(() => { onFetch() }, [onFetch])

  return (
    <div>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
        Gestión de Usuarios ({users.length})
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rol</th>
              {currentRol === 'superadmin' && (
                <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.id === currentUserId ? 0.7 : 1 }}>
                <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text)' }}>
                  {u.nombre} {u.id === currentUserId && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(tú)</span>}
                </td>
                <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '0.6rem 0.8rem' }}>
                  {editingRol === u.id ? (
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      <select value={selectedRol} onChange={e => setSelectedRol(e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem', borderRadius: theme.radiusSm, fontSize: '0.8rem',
                          border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text)',
                          outline: 'none',
                        }}>
                        {['superadmin', 'admin', 'vendedor', 'cliente', 'visitante'].map(r => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <button onClick={() => { onChangeRol(u.id, selectedRol); setEditingRol(null) }}
                        style={{ ...btn('primary'), padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Guardar</button>
                      <button onClick={() => setEditingRol(null)}
                        style={{ ...btn('ghost'), padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Cancelar</button>
                    </div>
                  ) : (
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: theme.radiusSm, fontSize: '0.8rem',
                      background: 'var(--primary-light)', color: 'var(--primary)',
                    }}>
                      {ROLE_LABELS[u.rol] || u.rol}
                    </span>
                  )}
                </td>
                {currentRol === 'superadmin' && (
                  <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                      {u.id !== currentUserId && (
                        <>
                          <button onClick={() => { setEditingRol(u.id); setSelectedRol(u.rol) }}
                            title="Cambiar rol"
                            style={{ ...btn('ghost'), padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                            <UserCog size={14} />
                          </button>
                          <button onClick={() => onDelete(u.id)}
                            title="Eliminar usuario"
                            style={{ ...btn('danger'), padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay usuarios</p>}
    </div>
  )
}

function InactiveUsersView({
  users, onFetch, onReactivate,
}: {
  users: Usuario[]; onFetch: () => void; onReactivate: (id: string) => Promise<void>
}) {
  useEffect(() => { onFetch() }, [onFetch])
  const [reactivating, setReactivating] = useState<string | null>(null)

  const handleReactivate = async (id: string) => {
    setReactivating(id)
    await onReactivate(id)
    setReactivating(null)
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
        Usuarios Inactivos ({users.length})
      </h3>
      {users.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay usuarios inactivos</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {users.map(u => (
            <div key={u.id} style={{ ...card(true), padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{u.nombre}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.email} — {ROLE_LABELS[u.rol] || u.rol}</div>
              </div>
              <button onClick={() => handleReactivate(u.id)} disabled={reactivating === u.id}
                style={{
                  ...btn('primary'), padding: '0.4rem 0.8rem', fontSize: '0.8rem',
                  opacity: reactivating === u.id ? 0.6 : 1,
                }}>
                <RotateCcw size={14} /> {reactivating === u.id ? '...' : 'Reactivar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DeletedView<T extends { id: string }>({
  title, items, onFetch, onRestore, renderItem,
}: {
  title: string; items: T[]; onFetch: () => void
  onRestore: (id: string) => Promise<void>
  renderItem: (item: T) => React.ReactNode
}) {
  useEffect(() => { onFetch() }, [onFetch])
  const [restoring, setRestoring] = useState<string | null>(null)

  const handleRestore = async (id: string) => {
    setRestoring(id)
    await onRestore(id)
    setRestoring(null)
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay elementos eliminados</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ ...card(true), padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{renderItem(item)}</div>
              <button onClick={() => handleRestore(item.id)} disabled={restoring === item.id}
                style={{
                  ...btn('primary'), padding: '0.4rem 0.8rem', fontSize: '0.8rem',
                  opacity: restoring === item.id ? 0.6 : 1,
                }}>
                <RotateCcw size={14} /> {restoring === item.id ? '...' : 'Restaurar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin
