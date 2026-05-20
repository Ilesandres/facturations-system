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

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  moneda: string
  stock: number
  categoria: string
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
