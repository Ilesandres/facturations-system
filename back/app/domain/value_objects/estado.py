from enum import Enum


class EstadoFactura(str, Enum):
    PENDIENTE = "pendiente"
    PAGADA = "pagada"
    CANCELADA = "cancelada"
    REEMBOLSADA = "reembolsada"


class EstadoPago(str, Enum):
    PENDIENTE = "pendiente"
    PROCESANDO = "procesando"
    COMPLETADO = "completado"
    FALLIDO = "fallido"
    REEMBOLSADO = "reembolsado"
