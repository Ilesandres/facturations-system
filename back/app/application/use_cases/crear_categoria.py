from uuid import uuid4
from ...domain.entities.categoria import Categoria
from ..ports.categoria_repositorio import CategoriaRepositorio


class CrearCategoriaCasoUso:
    def __init__(self, repositorio: CategoriaRepositorio):
        self._repositorio = repositorio

    async def ejecutar(self, nombre: str, descripcion: str = "") -> Categoria:
        categoria = Categoria(
            id=str(uuid4()),
            nombre=nombre,
            descripcion=descripcion,
        )
        await self._repositorio.guardar(categoria)
        return categoria
