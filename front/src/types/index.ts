export interface Ubicacion {
  latitud: number
  longitud: number
  direccion: string
  ciudad: string
  pais: string
}

export interface Persona {
  id: string
  nombre: string
  email: string
  telefono: string
  ubicacion: Ubicacion
  tipo: string
}

export interface Categoria {
  id: string
  nombre: string
  descripcion: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  moneda: string
  stock: number
  categoria_id: string
  image_url: string
  vendedor_id: string
}

export interface DetalleFactura {
  id: string
  producto_id: string
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  moneda: string
  subtotal: number
}

export interface Venta {
  id: string
  persona_id: string
  fecha: string
  detalles: DetalleFactura[]
  total: number
  moneda: string
}

export interface Recomendacion {
  persona_id: string
  nombre: string
  email: string
  distancia_km: number
  motivo: string
}

export interface RecomendacionProducto {
  producto_id: string
  nombre: string | null
  precio: number | null
  categoria_id: string | null
  vendedor_id: string | null
  image_url: string | null
  score: number
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono: string
  rol: string
  rol_id: string
  avatar_url: string
  tienda_id: string
  activo: boolean
}

export interface AdminStats {
  productos_activos: number
  categorias_activas: number
  usuarios_activos: number
  tiendas_activas: number
  personas_activas: number
  ventas: number
}
