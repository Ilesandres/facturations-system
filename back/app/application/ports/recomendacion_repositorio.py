from abc import ABC, abstractmethod
from typing import Any, Optional

from ...domain.entities.recomendacion import RecomendacionCliente


class RecomendacionRepositorio(ABC):
    @abstractmethod
    async def sincronizar_usuario(
        self,
        usuario_id: str,
        nombre: Optional[str] = None,
        email: Optional[str] = None,
        rol: Optional[str] = None,
    ) -> None: ...

    @abstractmethod
    async def registrar_visita(
        self,
        usuario_id: str,
        producto_id: str,
        categoria_id: Optional[str] = None,
        vendedor_id: Optional[str] = None,
        nombre: Optional[str] = None,
        precio: Optional[float] = None,
        image_url: Optional[str] = None,
    ) -> None: ...

    @abstractmethod
    async def registrar_compra(
        self,
        usuario_id: str,
        producto_id: str,
        categoria_id: Optional[str] = None,
        vendedor_id: Optional[str] = None,
        nombre: Optional[str] = None,
        precio: Optional[float] = None,
        image_url: Optional[str] = None,
    ) -> None: ...

    @abstractmethod
    async def recomendar_por_cercania(
        self, persona_id: str, radio_km: float = 5.0, limite: int = 5
    ) -> list[RecomendacionCliente]: ...

    @abstractmethod
    async def recomendar_productos(
        self, usuario_id: str, limite: int = 10
    ) -> list[dict[str, Any]]: ...
