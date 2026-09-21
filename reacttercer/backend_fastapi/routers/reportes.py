"""Endpoints de reportes: reporte diario de ventas en JSON, PDF y Excel."""

from datetime import date, datetime, time
from decimal import Decimal

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..common import to_float, venta_dict
from ..database import get_db
from ..models import DetalleVenta, Usuario, Venta
from ..security import require_roles
from ..services.reportes import construir_excel_reporte_diario, construir_pdf_reporte_diario

router = APIRouter(prefix='/api/reportes', tags=['Reportes'])


def reporte_diario(db: Session, fecha: date) -> dict:
    """Recopila el reporte diario de ventas con su resumen."""
    ventas = db.scalars(
        select(Venta)
        .where(Venta.fecha >= datetime.combine(fecha, time.min))
        .where(Venta.fecha <= datetime.combine(fecha, time.max))
        .order_by(Venta.id)
    ).all()

    detalle = []
    for venta in ventas:
        detalles = db.scalars(
            select(DetalleVenta).where(DetalleVenta.venta_id == venta.id).order_by(DetalleVenta.id)
        ).all()
        detalle.append(venta_dict(
            venta,
            cliente=db.get(Usuario, venta.cliente_id),
            vendedor=db.get(Usuario, venta.usuario_id) if venta.usuario_id else None,
            detalles=detalles,
        ))

    validas = [venta for venta in detalle if venta['estado'] != 'anulada']
    total_vendido = sum((Decimal(str(venta['total'])) for venta in validas), Decimal('0'))
    total_impuestos = sum((Decimal(str(venta['impuesto'])) for venta in validas), Decimal('0'))
    total_descuentos = sum((Decimal(str(venta['descuento'])) for venta in validas), Decimal('0'))
    estados: dict[str, int] = {}
    for venta in detalle:
        estados[venta['estado']] = estados.get(venta['estado'], 0) + 1

    resumen = {
        'fecha': fecha.isoformat(),
        'cantidadVentas': len(validas),
        'totalVendido': to_float(total_vendido),
        'totalImpuestos': to_float(total_impuestos),
        'totalDescuentos': to_float(total_descuentos),
        'ticketPromedio': to_float(total_vendido / len(validas)) if validas else 0.0,
        'porEstado': estados,
    }
    return {'resumen': resumen, 'ventas': detalle}


@router.get('/ventas-diario')
def reporte_ventas_diario(
    fecha: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('admin', 'empleado')),
):
    """Reporte diario de ventas en JSON."""
    return reporte_diario(db, fecha)


@router.get('/ventas-diario/pdf')
def reporte_ventas_diario_pdf(
    fecha: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('admin', 'empleado')),
):
    """Exporta el reporte diario de ventas en PDF."""
    data = reporte_diario(db, fecha)
    pdf = construir_pdf_reporte_diario(fecha.isoformat(), data['ventas'], data['resumen'])
    return Response(
        content=pdf,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="reporte-ventas-{fecha.isoformat()}.pdf"'},
    )


@router.get('/ventas-diario/excel')
def reporte_ventas_diario_excel(
    fecha: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('admin', 'empleado')),
):
    """Exporta el reporte diario de ventas en Excel (.xlsx)."""
    data = reporte_diario(db, fecha)
    excel = construir_excel_reporte_diario(fecha.isoformat(), data['ventas'], data['resumen'])
    return Response(
        content=excel,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': f'attachment; filename="reporte-ventas-{fecha.isoformat()}.xlsx"'},
    )
