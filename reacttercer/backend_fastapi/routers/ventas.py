"""Endpoints del módulo de ventas (registro, historial y estados)."""

import os
from datetime import date, datetime, time
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..common import round_money, to_float, venta_dict
from ..database import get_db
from ..models import DetalleVenta, Producto, Servicio, Usuario, Venta
from ..schemas import VentaEstadoUpdate, VentaRequest
from ..security import get_current_user, require_roles

router = APIRouter(prefix='/api/ventas', tags=['Ventas'])


def _cliente_de_la_venta(data: VentaRequest, user: Usuario) -> int:
    """El cliente solo puede registrar ventas a su propio nombre."""
    if user.rol == 'cliente':
        return user.id
    cliente_id = data.clienteId or data.usuarioId
    if not cliente_id:
        raise HTTPException(status_code=400, detail='Debes indicar el cliente de la venta')
    return cliente_id


def _resolver_item(db: Session, item) -> dict:
    """Convierte un ítem del request en una fila de detalle_ventas."""
    if item.productoId:
        producto = db.get(Producto, item.productoId)
        if not producto:
            raise HTTPException(status_code=404, detail=f'El producto {item.productoId} no existe')
        tipo, descripcion, precio_catalogo = 'producto', producto.nombre, producto.precio
    else:
        servicio = db.get(Servicio, item.servicioId)
        if not servicio:
            raise HTTPException(status_code=404, detail=f'El servicio {item.servicioId} no existe')
        tipo, descripcion, precio_catalogo = 'servicio', servicio.nombre, servicio.precio

    precio = Decimal(item.precioUnitario) if item.precioUnitario is not None else Decimal(precio_catalogo)
    if precio <= 0:
        raise HTTPException(status_code=400, detail='El precio unitario debe ser mayor que cero')
    cantidad = Decimal(item.cantidad)
    descuento = Decimal(item.descuento)
    linea = round_money(cantidad * precio - descuento)
    if linea < 0:
        raise HTTPException(status_code=400, detail='El descuento de un ítem no puede superar su valor')

    return {
        'producto_id': item.productoId,
        'servicio_id': item.servicioId,
        'tipo': tipo,
        'descripcion': (item.descripcion or descripcion)[:160],
        'cantidad': cantidad,
        'precio_unitario': precio,
        'descuento': descuento,
        'subtotal': linea,
    }


def _detalles(db: Session, venta_id: int) -> list[DetalleVenta]:
    return db.scalars(
        select(DetalleVenta).where(DetalleVenta.venta_id == venta_id).order_by(DetalleVenta.id)
    ).all()


def _armar_venta(db: Session, venta: Venta) -> dict:
    return venta_dict(
        venta,
        cliente=db.get(Usuario, venta.cliente_id),
        vendedor=db.get(Usuario, venta.usuario_id) if venta.usuario_id else None,
        detalles=_detalles(db, venta.id),
    )


@router.post('', status_code=201)
def registrar_venta(data: VentaRequest, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    """Registra una venta con su detalle de productos y/o servicios."""
    cliente_id = _cliente_de_la_venta(data, user)
    cliente = db.get(Usuario, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail='El cliente indicado no existe')

    filas = [_resolver_item(db, item) for item in data.items]
    subtotal = round_money(sum((fila['subtotal'] for fila in filas), Decimal('0')))
    descuento = round_money(Decimal(data.descuento))
    if descuento > subtotal:
        raise HTTPException(status_code=400, detail='El descuento global no puede superar el subtotal')
    base = subtotal - descuento
    porcentaje = data.impuestoPorcentaje
    if porcentaje is None:
        porcentaje = Decimal(os.getenv('IMPUESTO_PORCENTAJE', '19'))
    impuesto = round_money(base * Decimal(porcentaje) / Decimal('100'))
    total = round_money(base + impuesto)

    venta = Venta(
        cliente_id=cliente_id,
        usuario_id=user.id,
        fecha=datetime.now(),
        subtotal=subtotal,
        descuento=descuento,
        impuesto=impuesto,
        total=total,
        estado=data.estado,
        observaciones=data.observaciones,
    )
    db.add(venta)
    db.flush()
    for fila in filas:
        db.add(DetalleVenta(venta_id=venta.id, **fila))
    db.commit()
    db.refresh(venta)
    return {'mensaje': 'Venta registrada correctamente', 'id': venta.id, 'venta': _armar_venta(db, venta)}


@router.get('')
def historial_ventas(
    fechaInicio: date | None = Query(default=None),
    fechaFin: date | None = Query(default=None),
    clienteId: int | None = Query(default=None),
    productoId: int | None = Query(default=None),
    servicioId: int | None = Query(default=None),
    estado: str | None = Query(default=None, pattern=r'^(pendiente|pagada|anulada)$'),
    totalMin: float | None = Query(default=None, ge=0),
    totalMax: float | None = Query(default=None, ge=0),
    buscar: str | None = Query(default=None, max_length=120),
    limite: int = Query(default=300, ge=1, le=1000),
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    """Historial de ventas con filtros por fecha, cliente, producto, servicio, estado y valor."""
    consulta = select(Venta)
    if user.rol == 'cliente':
        consulta = consulta.where(Venta.cliente_id == user.id)
    elif clienteId:
        consulta = consulta.where(Venta.cliente_id == clienteId)

    if fechaInicio:
        consulta = consulta.where(Venta.fecha >= datetime.combine(fechaInicio, time.min))
    if fechaFin:
        consulta = consulta.where(Venta.fecha <= datetime.combine(fechaFin, time.max))
    if estado:
        consulta = consulta.where(Venta.estado == estado)
    if totalMin is not None:
        consulta = consulta.where(Venta.total >= totalMin)
    if totalMax is not None:
        consulta = consulta.where(Venta.total <= totalMax)
    if productoId:
        consulta = consulta.where(
            Venta.id.in_(select(DetalleVenta.venta_id).where(DetalleVenta.producto_id == productoId))
        )
    if servicioId:
        consulta = consulta.where(
            Venta.id.in_(select(DetalleVenta.venta_id).where(DetalleVenta.servicio_id == servicioId))
        )
    if buscar:
        patron = f'%{buscar.strip().lower()}%'
        clientes = select(Usuario.id).where(
            func.lower(Usuario.nombre + ' ' + Usuario.apellido).like(patron)
        )
        consulta = consulta.where(
            Venta.cliente_id.in_(clientes)
            | Venta.id.in_(select(DetalleVenta.venta_id).where(func.lower(DetalleVenta.descripcion).like(patron)))
        )

    ventas = db.scalars(consulta.order_by(Venta.id.desc()).limit(limite)).all()
    detalle = [_armar_venta(db, venta) for venta in ventas]
    return {
        'total': len(detalle),
        'totalVendido': to_float(sum((venta.total for venta in ventas), Decimal('0'))),
        'ventas': detalle,
    }


@router.get('/{venta_id}')
def obtener_venta(venta_id: int, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    venta = db.get(Venta, venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail='Venta no encontrada')
    if user.rol == 'cliente' and venta.cliente_id != user.id:
        raise HTTPException(status_code=403, detail='Acceso denegado: esta venta no te pertenece')
    return _armar_venta(db, venta)


@router.patch('/{venta_id}/estado')
def actualizar_estado_venta(
    venta_id: int,
    data: VentaEstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('admin', 'empleado')),
):
    venta = db.get(Venta, venta_id)
    if not venta:
        raise HTTPException(status_code=404, detail='Venta no encontrada')
    venta.estado = data.estado
    db.commit()
    return {'mensaje': 'Estado de la venta actualizado correctamente', 'estado': venta.estado}
