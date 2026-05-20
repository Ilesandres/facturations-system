import api from './client'
import type { Producto } from '../types'

export const getProductos = (params?: Record<string, string>) =>
  api.get<Producto[]>('/productos', { params }).then(r => r.data)

export const getProducto = (id: string) =>
  api.get<Producto>(`/productos/${id}`).then(r => r.data)

export const createProducto = (data: Partial<Producto>) =>
  api.post<Producto>('/productos', data).then(r => r.data)

export const deleteProducto = (id: string) => api.delete(`/productos/${id}`)
