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
            "categoria_id": producto.categoria_id,
            "image_url": producto.image_url,
            "vendedor_id": producto.vendedor_id,
            "activo": producto.activo,
        }
        await self._collection.replace_one({"_id": producto.id}, doc, upsert=True)

    async def obtener_por_id(self, producto_id: str) -> Producto | None:
        doc = await self._collection.find_one({"_id": producto_id, "activo": {"$ne": False}})
        if not doc:
            return None
        return self._mapear_producto(doc)

    async def listar_todos(self) -> list[Producto]:
        docs = await self._collection.find({"activo": {"$ne": False}}).to_list(length=None)
        return [self._mapear_producto(d) for d in docs]

    async def buscar_por_categoria(self, categoria_id: str) -> list[Producto]:
        docs = await self._collection.find({"categoria_id": categoria_id, "activo": {"$ne": False}}).to_list(length=None)
        return [self._mapear_producto(d) for d in docs]

    async def buscar_por_vendedor(self, vendedor_id: str) -> list[Producto]:
        docs = await self._collection.find({"vendedor_id": vendedor_id, "activo": {"$ne": False}}).to_list(length=None)
        return [self._mapear_producto(d) for d in docs]

    async def eliminar(self, producto_id: str) -> None:
        await self._collection.update_one({"_id": producto_id}, {"$set": {"activo": False}})

    async def listar_eliminados(self) -> list[Producto]:
        docs = await self._collection.find({"activo": False}).to_list(length=None)
        return [self._mapear_producto(d) for d in docs]

    async def restaurar(self, producto_id: str) -> None:
        await self._collection.update_one({"_id": producto_id}, {"$set": {"activo": True}})

    def _mapear_producto(self, doc: dict) -> Producto:
        return Producto(
            id=doc["_id"],
            nombre=doc["nombre"],
            descripcion=doc["descripcion"],
            precio=Dinero(monto=doc["precio"], moneda=doc["moneda"]),
            stock=doc["stock"],
            categoria_id=doc["categoria_id"],
            image_url=doc.get("image_url", ""),
            vendedor_id=doc.get("vendedor_id", ""),
            activo=doc.get("activo", True),
        )
