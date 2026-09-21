"""Endpoints del módulo de facturación."""

from datetime import date, datetime, time
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..common import factura_dict, to_float
from ..database import get_db
from ..models import DetalleFactura, DetalleVenta, Factura, Usuario, Venta
from ..schemas import FacturaEstadoUpdate, FacturaRequest
from ..security import get_current_user, require_roles
from ..services.reportes import construir_pdf_factura

router = APIRouter(prefix='/api/facturas', tags=['Facturas'])


def _detalles(db: Session, factura_id: int) -> list[DetalleFactura]:
    return db.scalars(
        select(DetalleFactura).where(DetalleFactura.factura_id == factura_id).order_by(DetalleFactura.id)
    ).all()


def _armar(db: Session, factura: Factura) -> dict:
    return factura_dict(
        factura,
        cliente=db.get(Usuario, factura.cliente_id),
        detalles=_detalles(db, factura.id),
        venta=db.get(Venta, factura.venta_id),
    )


def _factura_o_404(db: Session, factura_id: int) -> Factura:
    factura = db.get(Factura, factura_id)
    if not factura:
        raise HTTPException(status_code=404, detail='Factura no encontrada')
    return factura


@router.post('', status_code=201)
def generar_factura(data: FacturaRequest, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    """Genera la factura (con su detalle) a partir de una venta registrada."""
    venta = db.get(Venta, data.ventaId)
    if not venta:
        raise HTTPException(status_code=404, detail='La venta indicada no existe')
    if user.rol == 'cliente' and venta.cliente_id != user.id:
        raise HTTPException(status_code=403, detail='Acceso denegado: esta venta no te pertenece')
    if venta.estado == 'anulada':
        raise HTTPException(status_code=400, detail='No se puede facturar una venta anulada')
    if db.scalar(select(Factura).where(Factura.venta_id == venta.id)):
        raise HTTPException(status_code=409, detail='Esta venta ya tiene una factura generada')

    factura = Factura(
        numero=f'FAC-{venta.fecha.strftime("%Y%m%d")}-{venta.id:05d}',
        venta_id=venta.id,
        cliente_id=venta.cliente_id,
        fecha=datetime.now(),
        subtotal=venta.subtotal - venta.descuento,
        impuesto=venta.impuesto,
        total=venta.total,
        estado='emitida',
    )
    db.add(factura)
    db.flush()

    for detalle in db.scalars(select(DetalleVenta).where(DetalleVenta.venta_id == venta.id)).all():
        db.add(DetalleFactura(
            factura_id=factura.id,
            descripcion=detalle.descripcion,
            cantidad=detalle.cantidad,
            precio_unitario=detalle.precio_unitario,
            subtotal=detalle.subtotal,
        ))

    db.commit()
    db.refresh(factura)
    return {'mensaje': 'Factura generada correctamente', 'id': factura.id, 'factura': _armar(db, factura)}


@router.get('')
def consultar_facturas(
    numero: str | None = Query(default=None, max_length=30),
    clienteId: int | None = Query(default=None),
    estado: str | None = Query(default=None, pattern=r'^(emitida|pagada|anulada)$'),
    fechaInicio: date | None = Query(default=None),
    fechaFin: date | None = Query(default=None),
    buscar: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    """Consulta de facturas por número, cliente, fecha o estado."""
    consulta = select(Factura)
    if user.rol == 'cliente':
        consulta = consulta.where(Factura.cliente_id == user.id)
    elif clienteId:
        consulta = consulta.where(Factura.cliente_id == clienteId)
    if numero:
        consulta = consulta.where(Factura.numero.like(f'%{numero.strip()}%'))
    if estado:
        consulta = consulta.where(Factura.estado == estado)
    if fechaInicio:
        consulta = consulta.where(Factura.fecha >= datetime.combine(fechaInicio, time.min))
    if fechaFin:
        consulta = consulta.where(Factura.fecha <= datetime.combine(fechaFin, time.max))
    if buscar:
        patron = f'%{buscar.strip().lower()}%'
        consulta = consulta.where(
            func.lower(Factura.numero).like(patron)
            | Factura.cliente_id.in_(
                select(Usuario.id).where(func.lower(Usuario.nombre + ' ' + Usuario.apellido).like(patron))
            )
        )

    facturas = db.scalars(consulta.order_by(Factura.id.desc())).all()
    detalle = [_armar(db, factura) for factura in facturas]
    return {
        'total': len(detalle),
        'totalFacturado': to_float(sum((factura.total for factura in facturas), Decimal('0'))),
        'facturas': detalle,
    }


@router.get('/{factura_id}')
def obtener_factura(factura_id: int, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    factura = _factura_o_404(db, factura_id)
    if user.rol == 'cliente' and factura.cliente_id != user.id:
        raise HTTPException(status_code=403, detail='Acceso denegado: esta factura no te pertenece')
    return _armar(db, factura)


@router.get('/{factura_id}/pdf')
def descargar_factura_pdf(factura_id: int, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    """Descarga la factura en PDF."""
    factura = _factura_o_404(db, factura_id)
    if user.rol == 'cliente' and factura.cliente_id != user.id:
        raise HTTPException(status_code=403, detail='Acceso denegado: esta factura no te pertenece')
    pdf = construir_pdf_factura(factura, db.get(Usuario, factura.cliente_id), _detalles(db, factura.id))
    return Response(
        content=pdf,
        media_type='application/pdf',
        headers={'Content-Disposition': f'inline; filename="factura-{factura.numero}.pdf"'},
    )


@router.patch('/{factura_id}/estado')
def actualizar_estado_factura(
    factura_id: int,
    data: FacturaEstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('admin', 'empleado')),
):
    factura = _factura_o_404(db, factura_id)
    factura.estado = data.estado
    if data.estado == 'pagada':
        venta = db.get(Venta, factura.venta_id)
        if venta:
            venta.estado = 'pagada'
    db.commit()
    return {'mensaje': 'Estado de la factura actualizado correctamente', 'estado': factura.estado}
