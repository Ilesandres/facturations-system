from ....application.ports.categoria_repositorio import CategoriaRepositorio
from ....domain.entities.categoria import Categoria
from ...config.database import DBConfig


class CategoriaRepositorioMongo(CategoriaRepositorio):
    def __init__(self):
        self._collection = DBConfig.get_mongo_db()["categorias"]

    async def guardar(self, categoria: Categoria) -> None:
        doc = {
            "_id": categoria.id,
            "nombre": categoria.nombre,
            "descripcion": categoria.descripcion,
        }
        await self._collection.replace_one({"_id": categoria.id}, doc, upsert=True)

    async def obtener_por_id(self, categoria_id: str) -> Categoria | None:
        doc = await self._collection.find_one({"_id": categoria_id})
        if not doc:
            return None
        return Categoria(id=doc["_id"], nombre=doc["nombre"], descripcion=doc.get("descripcion", ""))

    async def listar_todos(self, skip: int = 0, limit: int = 100) -> list[Categoria]:
        cursor = self._collection.find().skip(skip).limit(limit)
        return [
            Categoria(id=doc["_id"], nombre=doc["nombre"], descripcion=doc.get("descripcion", ""))
            async for doc in cursor
        ]

    async def eliminar(self, categoria_id: str) -> None:
        await self._collection.delete_one({"_id": categoria_id})

    async def contar(self) -> int:
        return await self._collection.count_documents({})
