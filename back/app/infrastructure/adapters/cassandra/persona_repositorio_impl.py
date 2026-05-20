import asyncio

from ....application.ports.persona_repositorio import PersonaRepositorio
from ....domain.entities.persona import Persona
from ....domain.value_objects.ubicacion import Ubicacion
from ...config.database import DBConfig


class PersonaRepositorioCassandra(PersonaRepositorio):
    def __init__(self):
        self._session = DBConfig.get_cassandra_session()

    async def guardar(self, persona: Persona) -> None:
        await asyncio.to_thread(
            self._session.execute,
            """
            INSERT INTO personas (id, nombre, email, telefono, latitud, longitud, direccion, ciudad, pais, tipo, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                persona.id,
                persona.nombre,
                persona.email,
                persona.telefono,
                persona.ubicacion.latitud,
                persona.ubicacion.longitud,
                persona.ubicacion.direccion,
                persona.ubicacion.ciudad,
                persona.ubicacion.pais,
                persona.tipo,
                persona.activo,
            ),
        )

    async def obtener_por_id(self, persona_id: str) -> Persona | None:
        row = await asyncio.to_thread(
            lambda: self._session.execute(
                "SELECT * FROM personas WHERE id = %s", (persona_id,)
            ).one()
        )
        if not row:
            return None
        p = self._mapear_persona(row)
        if not p.activo:
            return None
        return p

    async def listar_todos(self) -> list[Persona]:
        rows = await asyncio.to_thread(
            self._session.execute,
            "SELECT * FROM personas WHERE activo = true ALLOW FILTERING",
        )
        return [self._mapear_persona(row) for row in rows]

    async def eliminar(self, persona_id: str) -> None:
        await asyncio.to_thread(
            self._session.execute,
            "UPDATE personas SET activo = false WHERE id = %s",
            (persona_id,),
        )

    def _mapear_persona(self, row) -> Persona:
        return Persona(
            id=row.id,
            nombre=row.nombre,
            email=row.email,
            telefono=row.telefono,
            ubicacion=Ubicacion(
                latitud=row.latitud,
                longitud=row.longitud,
                direccion=row.direccion,
                ciudad=row.ciudad,
                pais=row.pais,
            ),
            tipo=row.tipo,
            activo=getattr(row, "activo", True),
        )
