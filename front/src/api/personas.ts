import api from './client'
import type { Persona } from '../types'

export const getPersonas = () => api.get<Persona[]>('/personas').then(r => r.data)

export const getPersona = (id: string) => api.get<Persona>(`/personas/${id}`).then(r => r.data)

export const createPersona = (data: Omit<Persona, 'id'>) =>
  api.post<Persona>('/personas', data).then(r => r.data)

export const deletePersona = (id: string) => api.delete(`/personas/${id}`)
