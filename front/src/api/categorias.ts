import api from './client'

export const getCategorias = () => api.get<string[]>('/productos/categorias').then(r => r.data)
