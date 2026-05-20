from ....application.ports.producto_repositorio import ProductoRepositorio
from ....domain.entities.producto import Producto
from ....domain.value_objects.dinero import Dinero
from ...config.database import DBConfig


class ProductoRepositorioMongo(ProductoRepositorio):
    def __init__(self):
        self._collection = DBConfig.get_mongo_db()["productos"]

    async def guardar(self, producto: Producto) -> None:
        doc = {
            "_id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": producto.precio.monto,
            "moneda": producto.precio.moneda,
            "stock": producto.stock,
            "categoria": producto.categoria,
        }
        await self._collection.replace_one({"_id": producto.id}, doc, upsert=True)

    async def obtener_por_id(self, producto_id: str) -> Producto | None:
        doc = await self._collection.find_one({"_id": producto_id})
        if not doc:
            return None
        return self._mapear_producto(doc)

    async def listar_todos(self) -> list[Producto]:
        docs = await self._collection.find().to_list(length=None)
        return [self._mapear_producto(d) for d in docs]

    async def buscar_por_categoria(self, categoria: str) -> list[Producto]:
        docs = await self._collection.find({"categoria": categoria}).to_list(length=None)
        return [self._mapear_producto(d) for d in docs]

    async def eliminar(self, producto_id: str) -> None:
        await self._collection.delete_one({"_id": producto_id})

    def _mapear_producto(self, doc: dict) -> Producto:
        return Producto(
            id=doc["_id"],
            nombre=doc["nombre"],
            descripcion=doc["descripcion"],
            precio=Dinero(monto=doc["precio"], moneda=doc["moneda"]),
            stock=doc["stock"],
            categoria=doc["categoria"],
        )
