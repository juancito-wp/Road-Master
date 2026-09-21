"""Pruebas end-to-end del quinto avance (ventas, facturas, reportes, PQR, chatbot y dashboards).

Ejecutar desde la raíz del proyecto:

    ..\\.venv\\Scripts\\python.exe -m backend_fastapi.tests.test_quinto_avance

Crea datos temporales marcados con el correo `prueba.quinto...@roadmaster.test`
y los elimina al finalizar, sin tocar la información real del sistema.
"""

import sys
import uuid
from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import delete, select

from ..database import SessionLocal
from ..main import app
from ..models import Conversacion, DetalleFactura, DetalleVenta, Factura, Mensaje, Pqr, Producto, Servicio, Usuario, Venta
from ..security import create_token, hash_password

client = TestClient(app)
resultados: list[str] = []


def verificar(condicion: bool, descripcion: str) -> None:
    if not condicion:
        raise AssertionError(f'FALLO -> {descripcion}')
    resultados.append(f'OK -> {descripcion}')


def crear_usuario(db, rol: str, marca: str) -> Usuario:
    sufijo = uuid.uuid4().hex[:8]
    user = Usuario(
        nombre='Prueba', apellido=rol.capitalize(), tipo_documento='CC',
        numero_documento=f'{uuid.uuid4().int % 10**10:010d}',
        direccion='Calle de prueba 123', telefono='3001234567',
        email=f'prueba.quinto.{marca}.{sufijo}@roadmaster.test',
        password=hash_password('Prueba1234'), rol=rol, estado='activo',
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def cabecera(user: Usuario) -> dict:
    return {'Authorization': f'Bearer {create_token(user)}'}


def limpiar(db, ids_usuarios: list[int], ids_ventas: list[int], ids_facturas: list[int], sesiones: list[str]) -> None:
    db.rollback()  # reinicia la instantánea de MySQL antes de localizar los datos creados
    if ids_facturas:
        db.execute(delete(DetalleFactura).where(DetalleFactura.factura_id.in_(ids_facturas)))
        db.execute(delete(Factura).where(Factura.id.in_(ids_facturas)))
    if ids_ventas:
        db.execute(delete(DetalleVenta).where(DetalleVenta.venta_id.in_(ids_ventas)))
        db.execute(delete(Venta).where(Venta.id.in_(ids_ventas)))
    if sesiones:
        conversaciones = db.scalars(select(Conversacion).where(Conversacion.sesion.in_(sesiones))).all()
        ids_conversaciones = [conversacion.id for conversacion in conversaciones]
        if ids_conversaciones:
            db.execute(delete(Mensaje).where(Mensaje.conversacion_id.in_(ids_conversaciones)))
            db.execute(delete(Conversacion).where(Conversacion.id.in_(ids_conversaciones)))
    if ids_usuarios:
        db.execute(delete(Pqr).where(Pqr.usuario_id.in_(ids_usuarios)))
        db.execute(delete(Usuario).where(Usuario.id.in_(ids_usuarios)))
    db.commit()


def ejecutar() -> None:
    db = SessionLocal()
    ids_usuarios: list[int] = []
    ids_ventas: list[int] = []
    ids_facturas: list[int] = []
    sesiones: list[str] = []
    try:
        cliente = crear_usuario(db, 'cliente', 'cliente')
        admin = crear_usuario(db, 'admin', 'admin')
        ids_usuarios = [cliente.id, admin.id]

        producto = db.scalar(select(Producto).limit(1))
        if not producto:
            producto = Producto(nombre='Producto de prueba', precio=Decimal('5000000'), estado='activo')
            db.add(producto)
            db.commit()
            db.refresh(producto)
        servicio = db.scalar(select(Servicio).limit(1))
        if not servicio:
            servicio = Servicio(nombre='Servicio de prueba', precio=Decimal('120000'), estado='activo')
            db.add(servicio)
            db.commit()
            db.refresh(servicio)

        # 1. Registro de venta (producto + servicio)
        venta_payload = {
            'items': [
                {'productoId': producto.id, 'cantidad': 1, 'descuento': 100000},
                {'servicioId': servicio.id, 'cantidad': 2},
            ],
            'descuento': 50000,
            'impuestoPorcentaje': 19,
            'observaciones': 'Venta creada por la prueba automatizada del quinto avance',
        }
        respuesta = client.post('/api/ventas', json=venta_payload, headers=cabecera(cliente))
        verificar(respuesta.status_code == 201, f'POST /api/ventas responde 201 (obtuvo {respuesta.status_code})')
        venta = respuesta.json()['venta']
        ids_ventas.append(venta['id'])
        verificar(len(venta['detalles']) == 2, 'La venta guarda el detalle de producto y servicio')
        esperado_subtotal = float(producto.precio) - 100000 + 2 * float(servicio.precio)
        verificar(abs(venta['subtotal'] - esperado_subtotal) < 0.01, f'Subtotal calculado = {venta["subtotal"]}')
        base = esperado_subtotal - 50000
        verificar(abs(venta['impuesto'] - round(base * 0.19, 2)) < 0.02, f'Impuesto calculado = {venta["impuesto"]}')
        verificar(abs(venta['total'] - round(base * 1.19, 2)) < 0.02, f'Total calculado = {venta["total"]}')
        verificar(venta['estado'] == 'pendiente', 'La venta inicia en estado pendiente')

        # 2. Historial de ventas con filtros
        respuesta = client.get('/api/ventas', params={'clienteId': cliente.id, 'estado': 'pendiente'},
                               headers=cabecera(admin))
        verificar(respuesta.status_code == 200 and respuesta.json()['total'] == 1,
                  'GET /api/ventas filtra por cliente y estado')
        respuesta = client.get('/api/ventas', params={'productoId': producto.id}, headers=cabecera(admin))
        verificar(respuesta.json()['total'] == 1, 'GET /api/ventas filtra por producto')
        respuesta = client.get('/api/ventas', params={'totalMin': 0, 'totalMax': 1}, headers=cabecera(admin))
        verificar(respuesta.json()['total'] == 0, 'GET /api/ventas filtra por rango de valor')
        respuesta = client.get(f'/api/ventas/{venta["id"]}', headers=cabecera(admin))
        verificar(respuesta.status_code == 200, 'GET /api/ventas/{id} devuelve el detalle de la venta')

        # 3. Protección por roles
        respuesta = client.get('/api/ventas')
        verificar(respuesta.status_code == 403, 'GET /api/ventas exige token JWT (403 sin token)')
        respuesta = client.get('/api/reportes/ventas-diario', headers=cabecera(cliente))
        verificar(respuesta.status_code == 403, 'El reporte diario está protegido para roles admin/empleado')

        # 4. Facturación
        respuesta = client.post('/api/facturas', json={'ventaId': venta['id']}, headers=cabecera(admin))
        verificar(respuesta.status_code == 201, f'POST /api/facturas responde 201 (obtuvo {respuesta.status_code})')
        factura = respuesta.json()['factura']
        ids_facturas.append(factura['id'])
        verificar(factura['numero'].startswith('FAC-'), f'La factura tiene número {factura["numero"]}')
        verificar(len(factura['detalles']) == 2, 'La factura copia el detalle de la venta')
        respuesta = client.post('/api/facturas', json={'ventaId': venta['id']}, headers=cabecera(admin))
        verificar(respuesta.status_code == 409, 'No se permite facturar dos veces la misma venta')

        # 5. Consulta y descarga de facturas
        respuesta = client.get('/api/facturas', params={'numero': factura['numero']}, headers=cabecera(admin))
        verificar(respuesta.json()['total'] == 1, 'GET /api/facturas busca por número de factura')
        respuesta = client.get('/api/facturas', params={'buscar': 'Prueba'}, headers=cabecera(admin))
        verificar(respuesta.json()['total'] >= 1, 'GET /api/facturas busca por nombre del cliente')
        respuesta = client.get(f'/api/facturas/{factura["id"]}/pdf', headers=cabecera(admin))
        verificar(respuesta.status_code == 200 and respuesta.content[:5] == b'%PDF-',
                  'GET /api/facturas/{id}/pdf devuelve el PDF de la factura')
        respuesta = client.patch(f'/api/facturas/{factura["id"]}/estado', json={'estado': 'pagada'}, headers=cabecera(admin))
        verificar(respuesta.status_code == 200, 'PATCH /api/facturas/{id}/estado actualiza el estado')
        db.rollback()  # reinicia la instantánea de MySQL para leer los cambios hechos por la API
        venta_db = db.get(Venta, venta['id'])
        verificar(venta_db is not None and venta_db.estado == 'pagada',
                  'Al pagar la factura la venta pasa a pagada')

        # 6. Reporte diario JSON, PDF y Excel
        hoy = date.today().isoformat()
        respuesta = client.get('/api/reportes/ventas-diario', params={'fecha': hoy}, headers=cabecera(admin))
        verificar(respuesta.status_code == 200 and respuesta.json()['resumen']['cantidadVentas'] >= 1,
                  'GET /api/reportes/ventas-diario consolida las ventas del día')
        respuesta = client.get('/api/reportes/ventas-diario/pdf', params={'fecha': hoy}, headers=cabecera(admin))
        verificar(respuesta.content[:5] == b'%PDF-', 'La exportación del reporte diario genera un PDF válido')
        respuesta = client.get('/api/reportes/ventas-diario/excel', params={'fecha': hoy}, headers=cabecera(admin))
        verificar(respuesta.content[:2] == b'PK', 'La exportación del reporte diario genera un Excel (.xlsx) válido')

        # 7. PQR
        respuesta = client.post('/api/pqr', json={
            'tipo': 'reclamo', 'asunto': 'Prueba de PQR automatizada',
            'descripcion': 'Descripción de prueba para validar el flujo completo de PQR del quinto avance.',
        }, headers=cabecera(cliente))
        verificar(respuesta.status_code == 201, f'POST /api/pqr responde 201 (obtuvo {respuesta.status_code})')
        pqr_id = respuesta.json()['id']
        respuesta = client.get('/api/pqr', headers=cabecera(cliente))
        verificar(respuesta.json()['total'] == 1 and respuesta.json()['pqr'][0]['estado'] == 'pendiente',
                  'El cliente consulta únicamente sus propias PQR')
        respuesta = client.patch(f'/api/pqr/{pqr_id}/estado', json={'estado': 'en proceso'}, headers=cabecera(admin))
        verificar(respuesta.status_code == 200, 'PATCH /api/pqr/{id}/estado gestiona la PQR')
        respuesta = client.post(f'/api/pqr/{pqr_id}/respuesta',
                                json={'respuesta': 'Respuesta de prueba del área de servicio.', 'estado': 'respondida'},
                                headers=cabecera(admin))
        verificar(respuesta.json()['pqr']['estado'] == 'respondida', 'POST /api/pqr/{id}/respuesta responde la PQR')

        # 8. Chatbot con IA (o motor local si no hay OPENAI_API_KEY)
        respuesta = client.post('/api/chatbot/mensaje', json={'mensaje': 'Hola, ¿qué servicios de taller tienen?'})
        verificar(respuesta.status_code == 200, 'POST /api/chatbot/mensaje responde sin requerir autenticación')
        chat = respuesta.json()
        sesiones.append(chat['sesion'])
        verificar(len(chat['respuesta']) > 10, f'El chatbot responde (fuente: {chat["fuente"]})')
        verificar(chat['fuente'] in ('openai', 'local'), 'La fuente del chatbot es openai (con clave) o local (respaldo)')
        respuesta = client.post('/api/chatbot/mensaje', json={'mensaje': '¿Cómo registro una PQR?', 'sesion': chat['sesion']})
        verificar('PQR' in respuesta.json()['respuesta'].upper(), 'El chatbot orienta el proceso de PQR')
        respuesta = client.get(f'/api/chatbot/mensajes/{chat["sesion"]}')
        verificar(len(respuesta.json()['mensajes']) == 4, 'El historial guarda los mensajes de la conversación')
        respuesta = client.get('/api/chatbot/conversaciones', headers=cabecera(admin))
        verificar(respuesta.status_code == 200, 'GET /api/chatbot/conversaciones lista las conversaciones (admin)')

        # 9. Dashboards y estadísticas
        respuesta = client.get('/api/estadisticas/dashboard', headers=cabecera(admin))
        claves = {tarjeta['clave'] for tarjeta in respuesta.json()['cards']}
        verificar({'usuarios', 'productos', 'servicios', 'ventasTotales', 'facturacion', 'pqrPendientes'} <= claves,
                  'El dashboard administrativo expone los indicadores exigidos')
        respuesta = client.get('/api/estadisticas/dashboard', headers=cabecera(cliente))
        verificar(respuesta.json()['rol'] == 'cliente' and any(
            tarjeta['clave'] == 'misVentas' for tarjeta in respuesta.json()['cards']
        ), 'El dashboard del cliente muestra solo su información')
        respuesta = client.get('/api/estadisticas/ventas', params={
            'fechaInicio': hoy, 'fechaFin': hoy, 'agrupacion': 'dia', 'productoId': producto.id,
        }, headers=cabecera(admin))
        datos = respuesta.json()
        verificar(len(datos['temporal']) >= 1 and len(datos['productos']) >= 1,
                  'GET /api/estadisticas/ventas devuelve series para gráficos de barras y lineales')
        verificar(datos['cards'][0]['formato'] == 'numero' and datos['cards'][1]['formato'] == 'moneda',
                  'Las cards de estadísticas distinguen conteos y valores monetarios')
    finally:
        limpiar(db, ids_usuarios, ids_ventas, ids_facturas, sesiones)
        db.close()


if __name__ == '__main__':
    try:
        ejecutar()
    except AssertionError as error:
        print('\n'.join(resultados))
        print(f'\n{error}')
        sys.exit(1)
    except Exception as error:  # errores de conexión o de datos
        print('\n'.join(resultados))
        print(f'\nERROR inesperado: {type(error).__name__}: {error}')
        sys.exit(1)
    print('\n'.join(resultados))
    print(f'\n{len(resultados)} verificaciones superadas. Datos de prueba eliminados.')
