"""Funciones auxiliares compartidas por los routers del quinto avance."""

from decimal import Decimal
from typing import Any

from .models import DetalleFactura, DetalleVenta, Factura, Pqr, Usuario, Venta

CENTAVOS = Decimal('0.01')


def to_float(value: Any) -> float:
    """Convierte Decimal a float para devolver JSON legible."""
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def round_money(value: Decimal) -> Decimal:
    return Decimal(value).quantize(CENTAVOS)


def fecha_iso(value) -> str | None:
    return value.strftime('%Y-%m-%d %H:%M:%S') if value else None


def cliente_resumen(user: Usuario | None) -> dict | None:
    if not user:
        return None
    return {
        'id': user.id,
        'nombre': user.nombre,
        'apellido': user.apellido,
        'email': user.email,
        'numeroDocumento': user.numero_documento,
        'telefono': user.telefono,
        'direccion': user.direccion,
    }


def detalle_venta_dict(detalle: DetalleVenta) -> dict:
    return {
        'id': detalle.id,
        'productoId': detalle.producto_id,
        'servicioId': detalle.servicio_id,
        'tipo': detalle.tipo,
        'descripcion': detalle.descripcion,
        'cantidad': to_float(detalle.cantidad),
        'precioUnitario': to_float(detalle.precio_unitario),
        'descuento': to_float(detalle.descuento),
        'subtotal': to_float(detalle.subtotal),
    }


def venta_dict(
    venta: Venta,
    cliente: Usuario | None = None,
    vendedor: Usuario | None = None,
    detalles: list[DetalleVenta] | None = None,
) -> dict:
    return {
        'id': venta.id,
        'clienteId': venta.cliente_id,
        'usuarioId': venta.usuario_id,
        'cliente': cliente_resumen(cliente),
        'vendedor': f'{vendedor.nombre} {vendedor.apellido}' if vendedor else None,
        'fecha': fecha_iso(venta.fecha),
        'subtotal': to_float(venta.subtotal),
        'descuento': to_float(venta.descuento),
        'impuesto': to_float(venta.impuesto),
        'total': to_float(venta.total),
        'estado': venta.estado,
        'observaciones': venta.observaciones,
        'detalles': [detalle_venta_dict(detalle) for detalle in (detalles or [])],
    }


def detalle_factura_dict(detalle: DetalleFactura) -> dict:
    return {
        'id': detalle.id,
        'descripcion': detalle.descripcion,
        'cantidad': to_float(detalle.cantidad),
        'precioUnitario': to_float(detalle.precio_unitario),
        'subtotal': to_float(detalle.subtotal),
    }


def factura_dict(
    factura: Factura,
    cliente: Usuario | None = None,
    detalles: list[DetalleFactura] | None = None,
    venta: Venta | None = None,
) -> dict:
    return {
        'id': factura.id,
        'numero': factura.numero,
        'ventaId': factura.venta_id,
        'clienteId': factura.cliente_id,
        'cliente': cliente_resumen(cliente),
        'fecha': fecha_iso(factura.fecha),
        'subtotal': to_float(factura.subtotal),
        'impuesto': to_float(factura.impuesto),
        'total': to_float(factura.total),
        'estado': factura.estado,
        'ventaEstado': venta.estado if venta else None,
        'detalles': [detalle_factura_dict(detalle) for detalle in (detalles or [])],
    }


def pqr_dict(pqr: Pqr, usuario: Usuario | None = None, atendido: Usuario | None = None) -> dict:
    return {
        'id': pqr.id,
        'usuarioId': pqr.usuario_id,
        'cliente': f'{usuario.nombre} {usuario.apellido}' if usuario else None,
        'email': usuario.email if usuario else None,
        'tipo': pqr.tipo,
        'asunto': pqr.asunto,
        'descripcion': pqr.descripcion,
        'estado': pqr.estado,
        'respuesta': pqr.respuesta,
        'atendidoPor': f'{atendido.nombre} {atendido.apellido}' if atendido else None,
        'creadoEn': fecha_iso(pqr.creado_en),
        'actualizadoEn': fecha_iso(pqr.actualizado_en),
    }
