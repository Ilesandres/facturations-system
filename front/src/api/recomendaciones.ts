import api from './client'

export const getRecomendaciones = (limite = 10) =>
  api.get<{ producto_id: string; score: number }[]>('/recomendaciones/productos', {
    params: { limite },
  }).then(r => r.data)
