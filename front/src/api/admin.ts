import api from './client'
import type { AdminStats, Usuario, Producto, Categoria } from '../types'

interface TiendaResponse {
  id: string
  nombre: string
  vendedor_id: string
  descripcion: string
  avatar_url: string
  telefono: string
  direccion: string
}

export const getAdminStats = () =>
  api.get<AdminStats>('/admin/stats').then(r => r.data)

export const getUsers = () =>
  api.get<Usuario[]>('/auth/users').then(r => r.data)

export const getUser = (id: string) =>
  api.get<Usuario>(`/auth/users/${id}`).then(r => r.data)

export const updateUser = (id: string, data: Partial<Usuario>) =>
  api.put<Usuario>(`/auth/users/${id}`, data).then(r => r.data)

export const updateUserRol = (id: string, rol: string) =>
  api.put<Usuario>(`/auth/users/${id}/rol`, { rol }).then(r => r.data)

export const deleteUser = (id: string) =>
  api.delete(`/auth/users/${id}`)

export const getDeletedProducts = () =>
  api.get<Producto[]>('/productos/deleted/all').then(r => r.data)

export const restoreProduct = (id: string) =>
  api.post<Producto>(`/productos/${id}/restore`).then(r => r.data)

export const getDeletedTiendas = () =>
  api.get<TiendaResponse[]>('/tiendas/deleted/all').then(r => r.data)

export const restoreTienda = (id: string) =>
  api.post<TiendaResponse>(`/tiendas/${id}/restore`).then(r => r.data)

export const getDeletedCategorias = () =>
  api.get<Categoria[]>('/categorias/deleted/all').then(r => r.data)

export const restoreCategoria = (id: string) =>
  api.post<Categoria>(`/categorias/${id}/restore`).then(r => r.data)
