"""Endpoints del módulo PQR (peticiones, quejas, reclamos y sugerencias)."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..common import pqr_dict
from ..database import get_db
from ..models import Pqr, Usuario
from ..schemas import PqrEstadoUpdate, PqrRequest, PqrRespuestaRequest
from ..security import get_current_user, require_roles

router = APIRouter(prefix='/api/pqr', tags=['PQR'])

ESTADOS = ['pendiente', 'en proceso', 'respondida', 'cerrada']


def _armar(db: Session, pqr: Pqr) -> dict:
    return pqr_dict(
        pqr,
        usuario=db.get(Usuario, pqr.usuario_id),
        atendido=db.get(Usuario, pqr.atendido_por) if pqr.atendido_por else None,
    )


def _pqr_o_404(db: Session, pqr_id: int, user: Usuario) -> Pqr:
    pqr = db.get(Pqr, pqr_id)
    if not pqr:
        raise HTTPException(status_code=404, detail='PQR no encontrada')
    if user.rol == 'cliente' and pqr.usuario_id != user.id:
        raise HTTPException(status_code=403, detail='Acceso denegado: esta PQR no te pertenece')
    return pqr


@router.post('', status_code=201)
def registrar_pqr(data: PqrRequest, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    """Registra una nueva PQR asociada al usuario autenticado."""
    pqr = Pqr(
        usuario_id=user.id,
        tipo=data.tipo,
        asunto=data.asunto,
        descripcion=data.descripcion,
        estado='pendiente',
        creado_en=datetime.now(),
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return {'mensaje': 'PQR registrada correctamente. Pronto recibirás respuesta.', 'id': pqr.id, 'pqr': _armar(db, pqr)}


@router.get('')
def listar_pqr(
    estado: str | None = Query(default=None, pattern=r'^(pendiente|en proceso|respondida|cerrada)$'),
    tipo: str | None = Query(default=None, pattern=r'^(peticion|queja|reclamo|sugerencia)$'),
    buscar: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    """Consulta las PQR del cliente autenticado o todas las del sistema (admin/empleado)."""
    consulta = select(Pqr)
    if user.rol == 'cliente':
        consulta = consulta.where(Pqr.usuario_id == user.id)
    if estado:
        consulta = consulta.where(Pqr.estado == estado)
    if tipo:
        consulta = consulta.where(Pqr.tipo == tipo)
    if buscar:
        patron = f'%{buscar.strip().lower()}%'
        consulta = consulta.where(
            func.lower(Pqr.asunto).like(patron) | func.lower(Pqr.descripcion).like(patron)
        )

    registros = db.scalars(consulta.order_by(Pqr.id.desc())).all()
    conteos = {
        fila.estado: fila.total
        for fila in db.execute(select(Pqr.estado, func.count(Pqr.id).label('total')).group_by(Pqr.estado))
    }
    return {
        'total': len(registros),
        'resumen': {estado: conteos.get(estado, 0) for estado in ESTADOS},
        'pendientes': conteos.get('pendiente', 0),
        'pqr': [_armar(db, registro) for registro in registros],
    }


@router.get('/{pqr_id}')
def obtener_pqr(pqr_id: int, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    return _armar(db, _pqr_o_404(db, pqr_id, user))


@router.patch('/{pqr_id}/estado')
def actualizar_estado_pqr(
    pqr_id: int,
    data: PqrEstadoUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(require_roles('admin', 'empleado')),
):
    pqr = _pqr_o_404(db, pqr_id, user)
    pqr.estado = data.estado
    pqr.atendido_por = user.id
    pqr.actualizado_en = datetime.now()
    db.commit()
    return {'mensaje': 'Estado de la PQR actualizado correctamente', 'estado': pqr.estado}


@router.post('/{pqr_id}/respuesta')
def responder_pqr(
    pqr_id: int,
    data: PqrRespuestaRequest,
    db: Session = Depends(get_db),
    user: Usuario = Depends(require_roles('admin', 'empleado')),
):
    """Registra la respuesta oficial y actualiza el estado de la PQR."""
    pqr = _pqr_o_404(db, pqr_id, user)
    pqr.respuesta = data.respuesta
    pqr.estado = data.estado
    pqr.atendido_por = user.id
    pqr.actualizado_en = datetime.now()
    db.commit()
    return {'mensaje': 'Respuesta registrada correctamente', 'pqr': _armar(db, pqr)}
