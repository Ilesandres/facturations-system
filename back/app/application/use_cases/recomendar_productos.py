from typing import Any

from ..ports.producto_repositorio import ProductoRepositorio
from ..ports.recomendacion_repositorio import RecomendacionRepositorio


class RecomendarProductosCasoUso:
    def __init__(
        self,
        recomendacion_repo: RecomendacionRepositorio,
        producto_repo: ProductoRepositorio,
    ):
        self._recomendacion_repo = recomendacion_repo
        self._producto_repo = producto_repo

    async def ejecutar(
        self, usuario_id: str, limite: int = 10
    ) -> list[dict[str, Any]]:
        recomendaciones = await self._recomendacion_repo.recomendar_productos(
            usuario_id=usuario_id, limite=limite
        )

        for rec in recomendaciones:
            if not rec.get("nombre"):
                producto = await self._producto_repo.obtener_por_id(
                    rec["producto_id"]
                )
                if producto:
                    rec["nombre"] = producto.nombre
                    rec["precio"] = producto.precio.monto
                    rec["categoria_id"] = producto.categoria_id
                    rec["vendedor_id"] = producto.vendedor_id
                    rec["image_url"] = producto.image_url

        return recomendaciones
