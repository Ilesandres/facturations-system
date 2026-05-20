from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP


@dataclass(frozen=True)
class Dinero:
    monto: float
    moneda: str = "COP"

    def __post_init__(self):
        d = Decimal(str(self.monto)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        object.__setattr__(self, "monto", float(d))

    def __add__(self, otro: "Dinero") -> "Dinero":
        if self.moneda != otro.moneda:
            raise ValueError("No se pueden sumar monedas diferentes")
        return Dinero(monto=self.monto + otro.monto, moneda=self.moneda)

    def __mul__(self, factor: int) -> "Dinero":
        return Dinero(monto=self.monto * factor, moneda=self.moneda)
