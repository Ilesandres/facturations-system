import api from './client'
import type { Categoria } from '../types'

export const getCategorias = (skip = 0, limit = 50) =>
  api.get<{ items: Categoria[]; total: number }>('/categorias/', { params: { skip, limit } }).then(r => r.data)

export const createCategoria = (data: { nombre: string; descripcion?: string }) =>
  api.post<Categoria>('/categorias/', data).then(r => r.data)

export const deleteCategoria = (id: string) => api.delete(`/categorias/${id}`)
