from abc import ABC, abstractmethod
from ...domain.entities.usuario import Usuario


class UsuarioRepositorio(ABC):
    @abstractmethod
    async def guardar(self, usuario: Usuario) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, usuario_id: str) -> Usuario | None: ...

    @abstractmethod
    async def obtener_por_email(self, email: str) -> Usuario | None: ...

    @abstractmethod
    async def listar_todos(self) -> list[Usuario]: ...

    @abstractmethod
    async def eliminar(self, usuario_id: str) -> None: ...

    @abstractmethod
    async def reactivar(self, usuario_id: str) -> None: ...

    @abstractmethod
    async def listar_inactivos(self) -> list[Usuario]: ...
