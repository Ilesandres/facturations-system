import api from './client'

export interface Tienda {
  id: string
  nombre: string
  vendedor_id: string
  descripcion: string
  avatar_url: string
  telefono: string
  direccion: string
}

export function getTienda(id: string): Promise<Tienda> {
  return api.get(`/tiendas/${id}`).then(r => r.data)
}

export function getMiTienda(): Promise<Tienda> {
  return api.get('/tiendas/mi-tienda/mia').then(r => r.data)
}
