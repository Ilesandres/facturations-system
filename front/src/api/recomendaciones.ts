import api from './client'
import type { Recomendacion } from '../types'

export const getRecomendaciones = (personaId: string, radioKm = 5, limite = 5) =>
  api.get<Recomendacion[]>(`/recomendaciones/${personaId}`, {
    params: { radio_km: radioKm, limite },
  }).then(r => r.data)
