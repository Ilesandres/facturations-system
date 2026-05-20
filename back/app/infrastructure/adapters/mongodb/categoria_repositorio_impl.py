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
            "activo": categoria.activo,
        }
        await self._collection.replace_one({"_id": categoria.id}, doc, upsert=True)

    async def obtener_por_id(self, categoria_id: str) -> Categoria | None:
        doc = await self._collection.find_one({"_id": categoria_id, "activo": {"$ne": False}})
        if not doc:
            return None
        return Categoria(id=doc["_id"], nombre=doc["nombre"], descripcion=doc.get("descripcion", ""), activo=doc.get("activo", True))

    async def listar_todos(self, skip: int = 0, limit: int = 100) -> list[Categoria]:
        cursor = self._collection.find({"activo": {"$ne": False}}).skip(skip).limit(limit)
        return [
            Categoria(id=doc["_id"], nombre=doc["nombre"], descripcion=doc.get("descripcion", ""), activo=doc.get("activo", True))
            async for doc in cursor
        ]

    async def eliminar(self, categoria_id: str) -> None:
        await self._collection.update_one({"_id": categoria_id}, {"$set": {"activo": False}})

    async def listar_eliminados(self) -> list[Categoria]:
        cursor = self._collection.find({"activo": False})
        return [
            Categoria(id=doc["_id"], nombre=doc["nombre"], descripcion=doc.get("descripcion", ""), activo=False)
            async for doc in cursor
        ]

    async def restaurar(self, categoria_id: str) -> None:
        await self._collection.update_one({"_id": categoria_id}, {"$set": {"activo": True}})

    async def contar(self) -> int:
        return await self._collection.count_documents({"activo": {"$ne": False}})
