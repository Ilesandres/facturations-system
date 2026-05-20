import api from './client'

export const getProfile = () => api.get('/auth/me').then(r => r.data)

export const updateProfile = (data: Partial<{ nombre: string; telefono: string; avatar_url: string }>) =>
  api.put('/auth/me', data).then(r => r.data)
