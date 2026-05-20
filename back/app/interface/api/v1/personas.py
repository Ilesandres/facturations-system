from fastapi import APIRouter
from ...schemas.persona_schema import PersonaRequest, PersonaResponse, UbicacionSchema
from ....application.use_cases.crear_persona import CrearPersonaCasoUso
from ....application.ports.persona_repositorio import PersonaRepositorio
from ....domain.value_objects.ubicacion import Ubicacion
from ....infrastructure.adapters.cassandra.persona_repositorio_impl import (
    PersonaRepositorioCassandra,
)

router = APIRouter(prefix="/personas", tags=["Personas"])


def _get_repositorio() -> PersonaRepositorio:
    return PersonaRepositorioCassandra()


def _ubicacion_a_schema(u: Ubicacion) -> UbicacionSchema:
    return UbicacionSchema(
        latitud=u.latitud,
        longitud=u.longitud,
        direccion=u.direccion,
        ciudad=u.ciudad,
        pais=u.pais,
    )


@router.post("/", response_model=PersonaResponse)
async def crear_persona(body: PersonaRequest):
    caso_uso = CrearPersonaCasoUso(_get_repositorio())
    persona = await caso_uso.ejecutar(
        nombre=body.nombre,
        email=body.email,
        telefono=body.telefono,
        latitud=body.ubicacion.latitud,
        longitud=body.ubicacion.longitud,
        direccion=body.ubicacion.direccion,
        ciudad=body.ubicacion.ciudad,
        pais=body.ubicacion.pais,
        tipo=body.tipo,
    )
    return PersonaResponse(
        id=persona.id,
        nombre=persona.nombre,
        email=persona.email,
        telefono=persona.telefono,
        ubicacion=_ubicacion_a_schema(persona.ubicacion),
        tipo=persona.tipo,
    )


@router.get("/", response_model=list[PersonaResponse])
async def listar_personas():
    repositorio = _get_repositorio()
    personas = await repositorio.listar_todos()
    return [
        PersonaResponse(
            id=p.id,
            nombre=p.nombre,
            email=p.email,
            telefono=p.telefono,
            ubicacion=_ubicacion_a_schema(p.ubicacion),
            tipo=p.tipo,
        )
        for p in personas
    ]


@router.get("/{persona_id}", response_model=PersonaResponse)
async def obtener_persona(persona_id: str):
    repositorio = _get_repositorio()
    persona = await repositorio.obtener_por_id(persona_id)
    if not persona:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return PersonaResponse(
        id=persona.id,
        nombre=persona.nombre,
        email=persona.email,
        telefono=persona.telefono,
        ubicacion=_ubicacion_a_schema(persona.ubicacion),
        tipo=persona.tipo,
    )


@router.delete("/{persona_id}", status_code=204)
async def eliminar_persona(persona_id: str):
    repositorio = _get_repositorio()
    await repositorio.eliminar(persona_id)
