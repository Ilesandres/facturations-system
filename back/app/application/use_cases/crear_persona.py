from ...domain.entities.persona import Persona
from ...domain.value_objects.ubicacion import Ubicacion
from ..ports.persona_repositorio import PersonaRepositorio
from uuid import uuid4


class CrearPersonaCasoUso:
    def __init__(self, repositorio: PersonaRepositorio):
        self._repositorio = repositorio

    async def ejecutar(
        self,
        nombre: str,
        email: str,
        telefono: str,
        latitud: float,
        longitud: float,
        direccion: str = "",
        ciudad: str = "",
        pais: str = "",
        tipo: str = "cliente",
    ) -> Persona:
        persona = Persona(
            id=str(uuid4()),
            nombre=nombre,
            email=email,
            telefono=telefono,
            ubicacion=Ubicacion(
                latitud=latitud,
                longitud=longitud,
                direccion=direccion,
                ciudad=ciudad,
                pais=pais,
            ),
            tipo=tipo,
        )
        await self._repositorio.guardar(persona)
        return persona
