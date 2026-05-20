from dataclasses import dataclass
from math import radians, sin, cos, sqrt, atan2


@dataclass(frozen=True)
class Ubicacion:
    latitud: float
    longitud: float
    direccion: str = ""
    ciudad: str = ""
    pais: str = ""

    def distancia_km(self, otra: "Ubicacion") -> float:
        R = 6371.0
        dlat = radians(otra.latitud - self.latitud)
        dlon = radians(otra.longitud - self.longitud)
        a = sin(dlat / 2) ** 2 + cos(radians(self.latitud)) * cos(radians(otra.latitud)) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return R * c
