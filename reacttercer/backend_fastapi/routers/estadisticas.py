"""Endpoints de estadísticas para los dashboards administrativo, de empleado y de cliente."""

from datetime import date, datetime, time, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..common import to_float
from ..database import get_db
from ..models import (
    Conversacion, DetalleVenta, Factura, Mensaje, Pqr, Producto, Servicio, Solicitud, Usuario, Venta,
)
from ..security import get_current_user

router = APIRouter(prefix='/api/estadisticas', tags=['Estadísticas'])


def _contar(db: Session, modelo) -> int:
    return int(db.scalar(select(func.count()).select_from(modelo)) or 0)


def _suma(db: Session, columna, *condiciones) -> float:
    consulta = select(func.coalesce(func.sum(columna), 0))
    for condicion in condiciones:
        consulta = consulta.where(condicion)
    return to_float(db.scalar(consulta) or 0)


def _tarjeta(clave: str, etiqueta: str, valor: float, formato: str = 'numero') -> dict:
    return {'clave': clave, 'etiqueta': etiqueta, 'valor': round(valor, 2) if formato == 'moneda' else int(valor), 'formato': formato}


@router.get('/dashboard')
def dashboard(db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    """Indicadores consolidados del sistema, filtrados según el rol del usuario."""
    hoy = datetime.now()
    inicio_mes = hoy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if user.rol == 'cliente':
        ventas = db.scalars(select(Venta).where(Venta.cliente_id == user.id)).all()
        total_compras = sum((Decimal(venta.total) for venta in ventas), Decimal('0'))
        facturas = int(db.scalar(
            select(func.count()).select_from(Factura).where(Factura.cliente_id == user.id)
        ) or 0)
        pqr_propias = db.scalars(select(Pqr).where(Pqr.usuario_id == user.id)).all()
        pendientes = len([p for p in pqr_propias if p.estado in ('pendiente', 'en proceso')])
        return {
            'rol': user.rol,
            'cards': [
                _tarjeta('misVentas', 'Mis compras', len(ventas)),
                _tarjeta('miFacturacion', 'Total comprado', to_float(total_compras), 'moneda'),
                _tarjeta('misFacturas', 'Mis facturas', facturas),
                _tarjeta('misPqr', 'Mis PQR', len(pqr_propias)),
                _tarjeta('pqrPendientes', 'PQR en trámite', pendientes),
            ],
            'temporal': _serie_temporal(ventas, 'mes'),
            'estados': _conteo_estados(ventas, pqr_propias),
        }

    if user.rol == 'empleado':
        ventas = db.scalars(select(Venta)).all()
        pendientes_pqr = _contar_pqr_pendientes(db)
        solicitudes_pendientes = int(db.scalar(
            select(func.count()).select_from(Solicitud).where(Solicitud.estado == 'pendiente')
        ) or 0)
        ventas_mes = [venta for venta in ventas if venta.fecha and venta.fecha >= inicio_mes]
        return {
            'rol': user.rol,
            'cards': [
                _tarjeta('ventasTotales', 'Ventas registradas', len(ventas)),
                _tarjeta('ventasMes', 'Ventas del mes', len(ventas_mes)),
                _tarjeta('totalVendido', 'Total vendido', _suma(db, Venta.total, Venta.estado != 'anulada'), 'moneda'),
                _tarjeta('facturas', 'Facturas emitidas', _contar(db, Factura)),
                _tarjeta('pqrPendientes', 'PQR pendientes', pendientes_pqr),
                _tarjeta('solicitudesPendientes', 'Solicitudes pendientes', solicitudes_pendientes),
            ],
            'temporal': _serie_temporal(ventas, 'dia'),
            'estados': _conteo_estados(ventas, db.scalars(select(Pqr)).all()),
        }

    ventas = db.scalars(select(Venta)).all()
    return {
        'rol': user.rol,
        'cards': [
            _tarjeta('usuarios', 'Usuarios totales', _contar(db, Usuario)),
            _tarjeta('productos', 'Productos', _contar(db, Producto)),
            _tarjeta('servicios', 'Servicios', _contar(db, Servicio)),
            _tarjeta('ventasTotales', 'Ventas registradas', len(ventas)),
            _tarjeta('totalVendido', 'Total vendido', _suma(db, Venta.total, Venta.estado != 'anulada'), 'moneda'),
            _tarjeta('facturacion', 'Total facturado', _suma(db, Factura.total, Factura.estado != 'anulada'), 'moneda'),
            _tarjeta('facturas', 'Facturas emitidas', _contar(db, Factura)),
            _tarjeta('pqrRecibidas', 'PQR recibidas', _contar(db, Pqr)),
            _tarjeta('pqrPendientes', 'PQR pendientes', _contar_pqr_pendientes(db)),
            _tarjeta('conversaciones', 'Conversaciones de chat', _contar(db, Conversacion)),
            _tarjeta('mensajes', 'Mensajes del chatbot', _contar(db, Mensaje)),
            _tarjeta('solicitudesPendientes', 'Solicitudes pendientes', int(db.scalar(
                select(func.count()).select_from(Solicitud).where(Solicitud.estado == 'pendiente')
            ) or 0)),
        ],
        'temporal': _serie_temporal(ventas, 'dia'),
        'estados': _conteo_estados(ventas, db.scalars(select(Pqr)).all()),
    }


def _contar_pqr_pendientes(db: Session) -> int:
    return int(db.scalar(
        select(func.count()).select_from(Pqr).where(Pqr.estado.in_(['pendiente', 'en proceso']))
    ) or 0)


def _clave_temporal(fecha: datetime, agrupacion: str) -> tuple[str, str]:
    if agrupacion == 'mes':
        return fecha.strftime('%Y-%m'), fecha.strftime('%b %Y')
    if agrupacion == 'semana':
        anio, semana, _ = fecha.isocalendar()
        return f'{anio}-S{semana:02d}', f'Sem {semana} {anio}'
    return fecha.strftime('%Y-%m-%d'), fecha.strftime('%d/%m')


def _serie_temporal(ventas: list[Venta], agrupacion: str) -> list[dict]:
    grupos: dict[str, dict] = {}
    for venta in ventas:
        if not venta.fecha or venta.estado == 'anulada':
            continue
        clave, etiqueta = _clave_temporal(venta.fecha, agrupacion)
        grupo = grupos.setdefault(clave, {'clave': clave, 'etiqueta': etiqueta, 'cantidad': 0, 'total': 0.0, 'impuestos': 0.0})
        grupo['cantidad'] += 1
        grupo['total'] = round(grupo['total'] + to_float(venta.total), 2)
        grupo['impuestos'] = round(grupo['impuestos'] + to_float(venta.impuesto), 2)
    return sorted(grupos.values(), key=lambda grupo: grupo['clave'])


def _conteo_estados(ventas: list[Venta], pqr: list[Pqr]) -> dict:
    return {
        'ventas': {estado: len([venta for venta in ventas if venta.estado == estado])
                   for estado in ('pendiente', 'pagada', 'anulada')},
        'pqr': {estado: len([item for item in pqr if item.estado == estado])
                for estado in ('pendiente', 'en proceso', 'respondida', 'cerrada')},
    }


@router.get('/ventas')
def estadisticas_ventas(
    fechaInicio: date | None = Query(default=None),
    fechaFin: date | None = Query(default=None),
    productoId: int | None = Query(default=None),
    servicioId: int | None = Query(default=None),
    clienteId: int | None = Query(default=None),
    estado: str | None = Query(default=None, pattern=r'^(pendiente|pagada|anulada)$'),
    agrupacion: str = Query(default='dia', pattern=r'^(dia|semana|mes)$'),
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    """Datos para los gráficos del dashboard de ventas, con filtros dinámicos."""
    if not fechaFin:
        fechaFin = date.today()
    if not fechaInicio:
        fechaInicio = fechaFin - timedelta(days=29)

    consulta = select(Venta).where(
        Venta.fecha >= datetime.combine(fechaInicio, time.min),
        Venta.fecha <= datetime.combine(fechaFin, time.max),
    )
    if user.rol == 'cliente':
        consulta = consulta.where(Venta.cliente_id == user.id)
    elif clienteId:
        consulta = consulta.where(Venta.cliente_id == clienteId)
    if estado:
        consulta = consulta.where(Venta.estado == estado)
    if productoId:
        consulta = consulta.where(
            Venta.id.in_(select(DetalleVenta.venta_id).where(DetalleVenta.producto_id == productoId))
        )
    if servicioId:
        consulta = consulta.where(
            Venta.id.in_(select(DetalleVenta.venta_id).where(DetalleVenta.servicio_id == servicioId))
        )

    ventas = db.scalars(consulta.order_by(Venta.fecha)).all()
    ids = [venta.id for venta in ventas]
    detalles = db.scalars(select(DetalleVenta).where(DetalleVenta.venta_id.in_(ids))).all() if ids else []

    validas_lista = [venta for venta in ventas if venta.estado != 'anulada']
    total_vendido = sum((Decimal(venta.total) for venta in validas_lista), Decimal('0'))
    total_impuestos = sum((Decimal(venta.impuesto) for venta in validas_lista), Decimal('0'))
    validas = len(validas_lista)
    agrupados: dict[str, dict] = {}
    for detalle in detalles:
        grupo = agrupados.setdefault(detalle.descripcion, {'etiqueta': detalle.descripcion, 'cantidad': 0.0, 'total': 0.0})
        grupo['cantidad'] = round(grupo['cantidad'] + to_float(detalle.cantidad), 2)
        grupo['total'] = round(grupo['total'] + to_float(detalle.subtotal), 2)
    ranking = sorted(agrupados.values(), key=lambda item: item['total'], reverse=True)[:8]

    return {
        'filtros': {
            'fechaInicio': fechaInicio.isoformat(),
            'fechaFin': fechaFin.isoformat(),
            'agrupacion': agrupacion,
            'productoId': productoId,
            'servicioId': servicioId,
            'clienteId': clienteId,
            'estado': estado,
        },
        'cards': [
            _tarjeta('ventas', 'Ventas del periodo', validas),
            _tarjeta('totalVendido', 'Total vendido', to_float(total_vendido), 'moneda'),
            _tarjeta('ticketPromedio', 'Ticket promedio', to_float(total_vendido / validas) if validas else 0, 'moneda'),
            _tarjeta('impuestos', 'Impuestos generados', to_float(total_impuestos), 'moneda'),
            _tarjeta('unidades', 'Unidades vendidas', sum(to_float(detalle.cantidad) for detalle in detalles)),
        ],
        'temporal': _serie_temporal(ventas, agrupacion),
        'productos': ranking,
        'estados': _conteo_estados(ventas, []),
    }
