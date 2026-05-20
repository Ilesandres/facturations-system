from abc import ABC, abstractmethod
from ...domain.entities.persona import Persona


class PersonaRepositorio(ABC):
    @abstractmethod
    async def guardar(self, persona: Persona) -> None: ...

    @abstractmethod
    async def obtener_por_id(self, persona_id: str) -> Persona | None: ...

    @abstractmethod
    async def listar_todos(self) -> list[Persona]: ...

    @abstractmethod
    async def eliminar(self, persona_id: str) -> None: ...
