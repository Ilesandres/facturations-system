import type { RecomendacionProducto } from '../types'
import api from './client'

export const getRecomendaciones = (limite = 10) =>
  api.get<RecomendacionProducto[]>('/recomendaciones/productos', {
    params: { limite },
  }).then(r => r.data)
