from fastapi import APIRouter, Depends, HTTPException
from ...schemas.persona_schema import PersonaRequest, PersonaResponse, UbicacionSchema
from ....application.use_cases.crear_persona import CrearPersonaCasoUso
from ....application.ports.persona_repositorio import PersonaRepositorio
from ....domain.value_objects.ubicacion import Ubicacion
from ....infrastructure.adapters.cassandra.persona_repositorio_impl import (
    PersonaRepositorioCassandra,
)
from .auth import get_usuario_actual, require_rol

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


def _mapear(p) -> PersonaResponse:
    return PersonaResponse(
        id=p.id,
        nombre=p.nombre,
        email=p.email,
        telefono=p.telefono,
        ubicacion=_ubicacion_a_schema(p.ubicacion),
        tipo=p.tipo,
    )


@router.post("/", response_model=PersonaResponse)
async def crear_persona(
    body: PersonaRequest,
    usuario: dict = Depends(get_usuario_actual),
):
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
    return _mapear(persona)


@router.get("/", response_model=list[PersonaResponse])
async def listar_personas():
    repositorio = _get_repositorio()
    personas = await repositorio.listar_todos()
    return [_mapear(p) for p in personas]


@router.get("/{persona_id}", response_model=PersonaResponse)
async def obtener_persona(persona_id: str):
    repositorio = _get_repositorio()
    persona = await repositorio.obtener_por_id(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return _mapear(persona)


@router.put("/{persona_id}", response_model=PersonaResponse)
async def actualizar_persona(
    persona_id: str,
    body: PersonaRequest,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repositorio = _get_repositorio()
    persona = await repositorio.obtener_por_id(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    persona.nombre = body.nombre
    persona.email = body.email
    persona.telefono = body.telefono
    persona.ubicacion = Ubicacion(
        latitud=body.ubicacion.latitud,
        longitud=body.ubicacion.longitud,
        direccion=body.ubicacion.direccion,
        ciudad=body.ubicacion.ciudad,
        pais=body.ubicacion.pais,
    )
    persona.tipo = body.tipo
    await repositorio.guardar(persona)
    return _mapear(persona)


@router.delete("/{persona_id}", status_code=204)
async def eliminar_persona(
    persona_id: str,
    usuario: dict = Depends(require_rol("admin", "superadmin")),
):
    repositorio = _get_repositorio()
    persona = await repositorio.obtener_por_id(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    await repositorio.eliminar(persona_id)
