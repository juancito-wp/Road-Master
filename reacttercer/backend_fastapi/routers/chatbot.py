"""Endpoints del chatbot de atención al cliente (con IA y respaldo local)."""

import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..common import fecha_iso, to_float
from ..database import get_db
from ..models import Conversacion, Mensaje, Producto, Servicio, Usuario
from ..schemas import ChatRequest
from ..security import ALGORITHM, SECRET_KEY, bearer, require_roles
from ..services.ia import respuesta_local, responder_con_ia

router = APIRouter(prefix='/api/chatbot', tags=['Chatbot'])


def usuario_opcional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> Usuario | None:
    """El chatbot es público: si hay token válido se asocia la conversación al usuario."""
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    user = db.get(Usuario, payload.get('id'))
    return user if user and user.estado == 'activo' else None


def contexto_catalogo(db: Session) -> dict:
    """Contexto real entregado a la IA (catálogo, proyecto y enlaces)."""
    productos = db.scalars(select(Producto).where(Producto.estado == 'activo').limit(15)).all()
    servicios = db.scalars(select(Servicio).where(Servicio.estado == 'activo').limit(15)).all()
    frontend = os.getenv('PUBLIC_FRONTEND_URL', 'http://localhost:5173')
    return {
        'proyecto': 'Road Master - concesionario y taller',
        'productos': [
            {'nombre': p.nombre, 'marca': p.marca, 'precio': to_float(p.precio), 'categoria': p.categoria}
            for p in productos
        ],
        'servicios': [{'nombre': s.nombre, 'precio': to_float(s.precio)} for s in servicios],
        'proceso_compra': [
            'Explorar el catálogo de modelos y servicios',
            'Enviar la solicitud o cotización desde el sitio web',
            'Un asesor confirma disponibilidad, precio y forma de pago',
            'Se registra la venta y se emite la factura de venta',
        ],
        'estados_pqr': ['pendiente', 'en proceso', 'respondida', 'cerrada'],
        'enlaces': {
            'catalogo': f'{frontend}/modelos',
            'contacto': f'{frontend}/contacto',
            'pqr': f'{frontend}/mi-cuenta (sección PQR)',
        },
    }


def _mensaje_dict(mensaje: Mensaje) -> dict:
    return {
        'id': mensaje.id,
        'rol': mensaje.rol,
        'contenido': mensaje.contenido,
        'creadoEn': fecha_iso(mensaje.creado_en),
    }


@router.post('/mensaje')
def enviar_mensaje(
    data: ChatRequest,
    db: Session = Depends(get_db),
    user: Usuario | None = Depends(usuario_opcional),
):
    """Recibe el mensaje del usuario, responde con IA (o motor local) y guarda la conversación."""
    sesion = data.sesion or uuid.uuid4().hex
    conversacion = db.scalar(select(Conversacion).where(Conversacion.sesion == sesion))
    if not conversacion:
        conversacion = Conversacion(
            sesion=sesion,
            usuario_id=user.id if user else None,
            titulo=data.mensaje[:80],
            creado_en=datetime.now(),
        )
        db.add(conversacion)
        db.flush()

    historial_db = db.scalars(
        select(Mensaje).where(Mensaje.conversacion_id == conversacion.id).order_by(Mensaje.id)
    ).all()
    historial = [_mensaje_dict(mensaje) for mensaje in historial_db[-10:]]
    if not historial and data.historial:
        historial = [{'rol': item.rol, 'contenido': item.contenido} for item in data.historial]

    db.add(Mensaje(conversacion_id=conversacion.id, rol='user', contenido=data.mensaje, creado_en=datetime.now()))

    contexto = contexto_catalogo(db)
    try:
        respuesta, fuente = responder_con_ia(data.mensaje, historial, contexto)
    except Exception:  # pragma: no cover - el chatbot nunca debe romper el sitio
        respuesta, fuente = respuesta_local(data.mensaje, contexto), 'local'

    db.add(Mensaje(conversacion_id=conversacion.id, rol='assistant', contenido=respuesta, creado_en=datetime.now()))
    db.commit()

    return {'sesion': sesion, 'respuesta': respuesta, 'fuente': fuente}


@router.get('/mensajes/{sesion}')
def historial_conversacion(sesion: str, db: Session = Depends(get_db), user: Usuario | None = Depends(usuario_opcional)):
    """Devuelve los mensajes guardados de una sesión de chat."""
    conversacion = db.scalar(select(Conversacion).where(Conversacion.sesion == sesion))
    if not conversacion:
        raise HTTPException(status_code=404, detail='Conversación no encontrada')
    permitido = (
        conversacion.usuario_id is None
        or (user is not None and (user.rol in ('admin', 'empleado') or conversacion.usuario_id == user.id))
    )
    if not permitido:
        raise HTTPException(status_code=403, detail='Acceso denegado: esta conversación no te pertenece')
    mensajes = db.scalars(
        select(Mensaje).where(Mensaje.conversacion_id == conversacion.id).order_by(Mensaje.id)
    ).all()
    return {
        'sesion': sesion,
        'creadoEn': fecha_iso(conversacion.creado_en),
        'mensajes': [_mensaje_dict(mensaje) for mensaje in mensajes],
    }


@router.get('/conversaciones')
def listar_conversaciones(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('admin', 'empleado')),
):
    """Lista de conversaciones atendidas por el chatbot, con su número de mensajes."""
    filas = db.execute(
        select(Conversacion, func.count(Mensaje.id))
        .outerjoin(Mensaje, Mensaje.conversacion_id == Conversacion.id)
        .group_by(Conversacion.id)
        .order_by(Conversacion.id.desc())
        .limit(100)
    ).all()
    return {
        'total': len(filas),
        'conversaciones': [
            {
                'id': conversacion.id,
                'sesion': conversacion.sesion,
                'titulo': conversacion.titulo,
                'usuarioId': conversacion.usuario_id,
                'creadoEn': fecha_iso(conversacion.creado_en),
                'mensajes': cantidad,
            }
            for conversacion, cantidad in filas
        ],
    }
