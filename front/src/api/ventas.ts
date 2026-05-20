import api from './client'
import type { Venta } from '../types'

export const getVenta = (id: string) => api.get<Venta>(`/ventas/${id}`).then(r => r.data)

export const createVenta = (data: { persona_id: string; items: { producto_id: string; cantidad: number }[] }) =>
  api.post<Venta>('/ventas', data).then(r => r.data)
