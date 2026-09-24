import logging
import os
import re
import secrets
import smtplib
import shutil
import uuid
from base64 import b64encode
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
from email.message import EmailMessage
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request as UrlRequest, urlopen

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from .database import get_db
from .models import Producto, Servicio, Solicitud, Usuario
from .routers import chatbot, estadisticas, facturas, pqr, reportes, ventas
from .schemas import (
    EstadoUpdate, LoginRequest, PerfilUpdate, RecuperarPasswordRequest, RegistroUsuario,
    RestablecerPasswordRequest, ServicioRequest, ServicioResponse, SolicitudEstadoUpdate,
    UsuarioCreate, UsuarioResponse, UsuarioUpdate, VerificarCodigoRequest,
)
from .security import (
    create_reset_token, create_token, decode_reset_token, get_current_user,
    hash_password, require_roles, verify_password,
)

logger = logging.getLogger('road_master')

app = FastAPI(title='Road Master API', version='5.0.0')
origins = [origin.strip() for origin in os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173').split(',') if origin.strip()]
for desarrollo in ('http://localhost:5173', 'http://127.0.0.1:5173'):
    if desarrollo not in origins:
        origins.append(desarrollo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(ventas.router)
app.include_router(facturas.router)
app.include_router(reportes.router)
app.include_router(pqr.router)
app.include_router(chatbot.router)
app.include_router(estadisticas.router)

UPLOADS = Path(__file__).resolve().parent / 'uploads'
UPLOADS.mkdir(parents=True, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOADS), name='uploads')
codigos_recuperacion: dict[str, dict[str, object]] = {}


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, error: HTTPException):
    detail = error.detail if isinstance(error.detail, str) else 'La solicitud no es válida'
    return JSONResponse(status_code=error.status_code, content={'error': detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, error: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={'error': 'Los datos enviados no son válidos', 'detalles': error.errors()},
    )


def usuario_dict(user: Usuario) -> dict:
    return {
        'id': user.id, 'nombre': user.nombre, 'apellido': user.apellido,
        'tipoDocumento': user.tipo_documento, 'numeroDocumento': user.numero_documento,
        'direccion': user.direccion, 'telefono': user.telefono, 'email': user.email,
        'rol': user.rol, 'estado': user.estado,
    }


def base_publica(request: Request | None = None) -> str:
    '''URL publica con la que se sirven los archivos subidos.

    Usa PUBLIC_BASE_URL y, si no esta definida, la deduce del propio request (Railway
    reenvia el dominio publico en los encabezados Host y X-Forwarded-Proto).
    '''
    configurada = os.getenv('PUBLIC_BASE_URL')
    if configurada:
        return configurada.rstrip('/')
    if request is not None:
        esquema = request.headers.get('x-forwarded-proto', request.url.scheme)
        host = request.headers.get('host', request.url.netloc)
        return f'{esquema}://{host}'.rstrip('/')
    return 'http://localhost:8000'


def producto_dict(product: Producto, request: Request | None = None) -> dict:
    data = {column.name: getattr(product, column.name) for column in Producto.__table__.columns}
    if data['imagen']:
        # Los registros creados antes de configurar PUBLIC_BASE_URL guardan la base de
        # desarrollo (http://localhost:8000/uploads/...), que en produccion apunta a la
        # maquina del visitante y deja todas las tarjetas sin imagen. Se reescribe por la
        # base publica real.
        data['imagen'] = re.sub(r'^https?://(localhost|127\.0\.0\.1)(:\d+)?', base_publica(request), data['imagen'])
    return data


def parse_price(value: str) -> Decimal:
    try:
        price = Decimal(value)
    except InvalidOperation:
        raise HTTPException(status_code=400, detail='El precio debe ser un número mayor o igual a cero')
    if price < 0:
        raise HTTPException(status_code=400, detail='El precio debe ser un número mayor o igual a cero')
    return price


ASUNTO_RECUPERACION = 'Recuperación de contraseña - Road Master'
CORREO_RESEND_POR_DEFECTO = 'Road Master <onboarding@resend.dev>'


def cuerpos_correo_recuperacion(codigo: str) -> tuple[str, str]:
    '''Cuerpo del correo de recuperación: texto plano y HTML.'''
    texto = f'Tu código de recuperación de Road Master es: {codigo}. Es válido durante 10 minutos.'
    html = f'''<!doctype html>
<html><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#fff">
<div style="max-width:660px;margin:0 auto;background:#111827;padding:28px 30px 34px">
  <div style="text-align:center;color:#22d3ee;font-size:25px;font-weight:800;letter-spacing:2px">ROAD MASTER</div>
  <h1 style="font-size:21px;margin:28px 0 20px">Recuperación de contraseña</h1>
  <p>Hola,</p><p>Recibimos una solicitud para recuperar la contraseña de tu cuenta.</p>
  <p>Tu código de recuperación es:</p>
  <div style="margin:26px 0 34px;text-align:center;color:#c026d3;font-size:38px;font-weight:800;letter-spacing:10px">{codigo}</div>
  <p>Este código es válido durante <strong>10 minutos</strong>.</p>
  <p>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</p>
</div></body></html>'''
    return texto, html


def enviar_con_resend(api_key: str, email: str, texto: str, html: str) -> None:
    '''Envía el correo con la API HTTPS de Resend.

    Railway bloquea el SMTP saliente en los planes Free, Trial y Hobby, así que esta es la
    vía que funciona en cualquier plan. La importación es diferida para que el backend siga
    arrancando con la configuración local de SMTP aunque el paquete no esté instalado.
    '''
    try:
        import resend
    except ImportError as error:
        raise HTTPException(status_code=503, detail='Falta la librería resend en el servidor') from error

    resend.api_key = api_key
    try:
        resend.Emails.send({
            'from': os.getenv('RESEND_FROM', CORREO_RESEND_POR_DEFECTO),
            'to': [email],
            'subject': ASUNTO_RECUPERACION,
            'text': texto,
            'html': html,
        })
    except Exception as error:
        # El SDK y httpx lanzan tipos distintos de excepción; cualquiera deja el correo sin enviar.
        logger.exception('Resend no pudo enviar el correo de recuperación')
        raise HTTPException(status_code=503, detail='No fue posible enviar el correo de recuperación') from error


def enviar_con_smtp(email: str, texto: str, html: str) -> None:
    smtp_host = os.getenv('SMTP_HOST')
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    smtp_from = os.getenv('SMTP_FROM', smtp_user)
    if not smtp_host or not smtp_user or not smtp_password or not smtp_from:
        raise HTTPException(status_code=503, detail='El servicio de correo no está configurado')

    message = EmailMessage()
    message['Subject'] = ASUNTO_RECUPERACION
    message['From'] = smtp_from
    message['To'] = email
    message.set_content(texto)
    message.add_alternative(html, subtype='html')
    try:
        with smtplib.SMTP(smtp_host, int(os.getenv('SMTP_PORT', '587')), timeout=15) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as error:
        logger.exception('SMTP no pudo enviar el correo de recuperación')
        raise HTTPException(status_code=503, detail='No fue posible enviar el correo de recuperación') from error


def enviar_con_mailgun(email: str, texto: str, html: str) -> None:
    '''Envía el correo con la API HTTPS de Mailgun.

    Mailgun provisiona un dominio sandbox a cada cuenta, así que es la única vía que
    funciona sin comprar un dominio propio. A cambio, el dominio sandbox solo entrega a
    los destinatarios autorizados en el panel (máximo 5). Se usa la librería estándar para
    no sumar dependencias por una sola petición.
    '''
    api_key = os.getenv('MAILGUN_API_KEY')
    dominio = os.getenv('MAILGUN_DOMAIN')
    if not api_key or not dominio:
        raise HTTPException(status_code=503, detail='El servicio de correo no está configurado')
    base = 'https://api.eu.mailgun.net' if os.getenv('MAILGUN_REGION', 'us').lower() == 'eu' else 'https://api.mailgun.net'
    cuerpo = urlencode({
        'from': os.getenv('MAILGUN_FROM') or f'Road Master <postmaster@{dominio}>',
        'to': email,
        'subject': ASUNTO_RECUPERACION,
        'text': texto,
        'html': html,
    }).encode()
    peticion = UrlRequest(
        f'{base}/v3/{dominio}/messages',
        data=cuerpo,
        headers={
            'Authorization': f'Basic {b64encode(f"api:{api_key}".encode()).decode()}',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method='POST',
    )
    try:
        with urlopen(peticion, timeout=15) as respuesta:
            respuesta.read()
    except (HTTPError, URLError, OSError) as error:
        logger.exception('Mailgun no pudo enviar el correo de recuperación')
        raise HTTPException(status_code=503, detail='No fue posible enviar el correo de recuperación') from error


def enviar_correo_recuperacion(email: str, codigo: str) -> None:
    '''Envía el código de recuperación por la primera vía configurada.

    Orden: Mailgun (funciona sin dominio propio), Resend (exige dominio verificado) y, si
    no hay ninguna clave, SMTP (solo sirve en local o en el plan Pro de Railway).
    '''
    texto, html = cuerpos_correo_recuperacion(codigo)
    if os.getenv('MAILGUN_API_KEY') and os.getenv('MAILGUN_DOMAIN'):
        enviar_con_mailgun(email, texto, html)
        return
    api_key = os.getenv('RESEND_API_KEY')
    if api_key:
        enviar_con_resend(api_key, email, texto, html)
        return
    enviar_con_smtp(email, texto, html)


@app.get('/api/health')
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
        return {'status': 'OK', 'mensaje': 'Conexión exitosa'}
    except SQLAlchemyError as error:
        logger.exception('No fue posible conectar con la base de datos')
        raise HTTPException(status_code=503, detail='Error al conectar con la base de datos SQL') from error


@app.post('/api/auth/registro', status_code=201)
@app.post('/api/usuarios/registro', status_code=201)
def registrar_usuario(data: RegistroUsuario, db: Session = Depends(get_db)):
    if db.scalar(select(Usuario).where((Usuario.email == data.email.lower()) | (Usuario.numero_documento == data.numeroDocumento))):
        raise HTTPException(status_code=409, detail='El correo o documento ya está registrado')
    user = Usuario(
        nombre=data.nombre, apellido=data.apellido, tipo_documento=data.tipoDocumento,
        numero_documento=data.numeroDocumento, direccion=data.direccion, telefono=data.telefono,
        email=data.email.lower(), password=hash_password(data.password), rol='cliente', estado='activo',
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail='El correo o documento ya está registrado')
    return {'mensaje': 'Usuario registrado con éxito'}


@app.post('/api/auth/login')
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(Usuario).where(Usuario.email == data.email.lower()))
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    if user.estado != 'activo' or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail='Contraseña incorrecta')
    return {'mensaje': 'Login exitoso', 'token': create_token(user), 'usuario': usuario_dict(user)}


@app.post('/api/auth/recuperar-password')
def solicitar_recuperacion(data: RecuperarPasswordRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(Usuario).where(Usuario.email == data.email.lower()))
    if not user or user.estado != 'activo':
        raise HTTPException(status_code=404, detail='Este correo no está registrado')
    codigo = f'{secrets.randbelow(1_000_000):06d}'
    codigos_recuperacion[user.email] = {
        'hash': hash_password(codigo),
        'expira': datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    enviar_correo_recuperacion(user.email, codigo)
    return {'mensaje': 'Te enviamos un código de seis dígitos a tu correo.'}


@app.post('/api/auth/verificar-codigo')
def verificar_codigo(data: VerificarCodigoRequest, db: Session = Depends(get_db)):
    registro = codigos_recuperacion.get(data.email.lower())
    if not registro or datetime.now(timezone.utc) >= registro['expira']:
        codigos_recuperacion.pop(data.email.lower(), None)
        raise HTTPException(status_code=400, detail='El código no existe o expiró')
    if not verify_password(data.codigo, registro['hash']):
        raise HTTPException(status_code=400, detail='El código de recuperación es incorrecto')
    user = db.scalar(select(Usuario).where(Usuario.email == data.email.lower()))
    codigos_recuperacion.pop(data.email.lower(), None)
    if not user or user.estado != 'activo':
        raise HTTPException(status_code=400, detail='El usuario no está disponible')
    return {'mensaje': 'Código verificado correctamente', 'token': create_reset_token(user)}


@app.post('/api/auth/restablecer-password')
def restablecer_password(data: RestablecerPasswordRequest, db: Session = Depends(get_db)):
    user_id = decode_reset_token(data.token)
    user = db.get(Usuario, user_id)
    if not user or user.estado != 'activo':
        raise HTTPException(status_code=400, detail='El enlace de recuperación no es válido o expiró')
    user.password = hash_password(data.nuevaPassword)
    db.commit()
    return {'mensaje': 'Contraseña actualizada correctamente'}


@app.get('/api/usuarios', response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    return db.scalars(select(Usuario).order_by(Usuario.id.desc())).all()


@app.post('/api/usuarios', status_code=201)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    if db.scalar(select(Usuario).where((Usuario.email == data.email.lower()) | (Usuario.numero_documento == data.numeroDocumento))):
        raise HTTPException(status_code=409, detail='El correo o documento ya está registrado')
    user = Usuario(
        nombre=data.nombre, apellido=data.apellido, tipo_documento=data.tipoDocumento,
        numero_documento=data.numeroDocumento, direccion=data.direccion, telefono=data.telefono,
        email=data.email.lower(), password=hash_password(data.password), rol=data.rol, estado='activo',
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail='El correo o documento ya está registrado')
    db.refresh(user)
    return {'mensaje': 'Usuario creado correctamente', 'id': user.id}


@app.get('/api/usuarios/perfil')
def perfil(user: Usuario = Depends(get_current_user)):
    return {'mensaje': 'Perfil accedido con éxito', 'usuario': usuario_dict(user)}


@app.put('/api/usuarios/perfil')
def actualizar_perfil(data: PerfilUpdate, db: Session = Depends(get_db), user: Usuario = Depends(get_current_user)):
    for field, value in data.model_dump().items():
        setattr(user, field if field != 'telefono' else 'telefono', value.strip() if isinstance(value, str) else value)
    db.commit()
    return {'mensaje': 'Perfil actualizado correctamente'}


@app.get('/api/usuarios/{user_id}', response_model=UsuarioResponse)
def obtener_usuario(user_id: int, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    return user


@app.put('/api/usuarios/{user_id}')
def actualizar_usuario(user_id: int, data: UsuarioUpdate, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    values = data.model_dump()
    mapping = {'tipoDocumento': 'tipo_documento', 'numeroDocumento': 'numero_documento'}
    for field, value in values.items():
        setattr(user, mapping.get(field, field), value.strip() if isinstance(value, str) else value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail='El correo o documento ya está registrado')
    return {'mensaje': 'Usuario actualizado correctamente'}


@app.patch('/api/usuarios/{user_id}/estado')
def cambiar_estado(user_id: int, data: EstadoUpdate, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    user.estado = data.estado
    db.commit()
    return {'mensaje': 'Estado actualizado correctamente'}


@app.delete('/api/usuarios/{user_id}')
def eliminar_usuario(user_id: int, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    user = db.get(Usuario, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='Usuario no encontrado')
    db.delete(user)
    db.commit()
    return {'mensaje': 'Usuario eliminado correctamente'}


@app.get('/api/productos')
@app.get('/api/modelos')
def listar_productos(request: Request, db: Session = Depends(get_db)):
    return [producto_dict(product, request) for product in db.scalars(select(Producto).order_by(Producto.id.desc())).all()]


@app.get('/api/productos/{product_id}')
def obtener_producto(product_id: int, request: Request, db: Session = Depends(get_db)):
    product = db.get(Producto, product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Producto no encontrado')
    return producto_dict(product, request)


def product_form(nombre: str, precio: str):
    if not nombre.strip() or not 2 <= len(nombre.strip()) <= 120:
        raise HTTPException(status_code=400, detail='El nombre debe tener entre 2 y 120 caracteres')
    return nombre.strip(), parse_price(precio)


@app.post('/api/productos', status_code=201)
@app.post('/api/modelos', status_code=201)
def crear_producto(
    request: Request,
    nombre: str = Form(...), precio: str = Form(...), marca: str | None = Form(None),
    categoria: str | None = Form(None), descripcion: str | None = Form(None), potencia: str | None = Form(None),
    motor: str | None = Form(None), transmision: str | None = Form(None), aplicacion: str | None = Form(None),
    imagen: UploadFile | None = File(None), db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin')),
):
    nombre, precio = product_form(nombre, precio)
    if not imagen:
        raise HTTPException(status_code=400, detail='Debes seleccionar una imagen JPG, PNG o WEBP')
    if imagen.content_type not in {'image/jpeg', 'image/png', 'image/webp'}:
        raise HTTPException(status_code=400, detail='Solo se permiten imágenes JPG, PNG o WEBP')
    filename = f'{uuid.uuid4().hex}{Path(imagen.filename or "imagen").suffix.lower()}'
    with (UPLOADS / filename).open('wb') as output:
        shutil.copyfileobj(imagen.file, output)
    product = Producto(nombre=nombre, precio=precio, marca=marca, categoria=categoria, descripcion=descripcion,
                       potencia=potencia, motor=motor, transmision=transmision, aplicacion=aplicacion,
                       imagen=f'{base_publica(request)}/uploads/{filename}')
    db.add(product)
    db.commit()
    db.refresh(product)
    return {'id': product.id, 'mensaje': 'Producto creado correctamente'}


@app.put('/api/productos/{product_id}')
def actualizar_producto(
    request: Request,
    product_id: int, nombre: str = Form(...), precio: str = Form(...), marca: str | None = Form(None),
    categoria: str | None = Form(None), descripcion: str | None = Form(None), potencia: str | None = Form(None),
    motor: str | None = Form(None), transmision: str | None = Form(None), aplicacion: str | None = Form(None),
    imagen: UploadFile | None = File(None), db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin')),
):
    product = db.get(Producto, product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Producto no encontrado')
    product.nombre, product.precio = product_form(nombre, precio)
    for field, value in {'marca': marca, 'categoria': categoria, 'descripcion': descripcion, 'potencia': potencia,
                         'motor': motor, 'transmision': transmision, 'aplicacion': aplicacion}.items():
        setattr(product, field, value)
    if imagen:
        if imagen.content_type not in {'image/jpeg', 'image/png', 'image/webp'}:
            raise HTTPException(status_code=400, detail='Solo se permiten imágenes JPG, PNG o WEBP')
        filename = f'{uuid.uuid4().hex}{Path(imagen.filename or "imagen").suffix.lower()}'
        with (UPLOADS / filename).open('wb') as output:
            shutil.copyfileobj(imagen.file, output)
        product.imagen = f'{base_publica(request)}/uploads/{filename}'
    db.commit()
    return {'mensaje': 'Producto actualizado correctamente'}


@app.delete('/api/productos/{product_id}')
def eliminar_producto(product_id: int, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    product = db.get(Producto, product_id)
    if not product:
        raise HTTPException(status_code=404, detail='Producto no encontrado')
    db.delete(product)
    db.commit()
    return {'mensaje': 'Producto eliminado correctamente'}


@app.get('/api/servicios', response_model=list[ServicioResponse])
def listar_servicios(db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return db.scalars(select(Servicio).order_by(Servicio.id.desc())).all()


@app.get('/api/servicios/{service_id}', response_model=ServicioResponse)
def obtener_servicio(service_id: int, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    service = db.get(Servicio, service_id)
    if not service:
        raise HTTPException(status_code=404, detail='Servicio no encontrado')
    return service


@app.post('/api/servicios', status_code=201)
def crear_servicio(data: ServicioRequest, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin', 'empleado'))):
    service = Servicio(**data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return {'mensaje': 'Servicio creado exitosamente', 'id': service.id}


@app.put('/api/servicios/{service_id}')
def actualizar_servicio(service_id: int, data: ServicioRequest, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin', 'empleado'))):
    service = db.get(Servicio, service_id)
    if not service:
        raise HTTPException(status_code=404, detail='Servicio no encontrado')
    for field, value in data.model_dump().items():
        setattr(service, field, value)
    db.commit()
    return {'mensaje': 'Servicio actualizado correctamente'}


@app.delete('/api/servicios/{service_id}')
def eliminar_servicio(service_id: int, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin'))):
    service = db.get(Servicio, service_id)
    if not service:
        raise HTTPException(status_code=404, detail='Servicio no encontrado')
    db.delete(service)
    db.commit()
    return {'mensaje': 'Servicio eliminado correctamente'}


@app.post('/api/solicitudes', status_code=201)
def crear_solicitud(data: dict, db: Session = Depends(get_db), user: Usuario = Depends(require_roles('cliente'))):
    if not data.get('modeloId') or not data.get('tipoServicio') or len(data.get('comentarios', '')) > 1000:
        raise HTTPException(status_code=400, detail='Los datos de la solicitud no son válidos')
    if not db.get(Producto, data['modeloId']):
        raise HTTPException(status_code=404, detail='El modelo seleccionado no existe')
    request = Solicitud(usuario_id=user.id, producto_id=data['modeloId'], tipo_servicio=data['tipoServicio'], comentarios=data.get('comentarios'))
    db.add(request)
    db.commit()
    return {'id': request.id, 'mensaje': 'Solicitud enviada correctamente'}


@app.get('/api/solicitudes')
def listar_solicitudes(db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin', 'empleado'))):
    rows = db.execute(select(Solicitud, Producto.nombre, Usuario.nombre, Usuario.apellido, Usuario.email)
                      .join(Producto, Producto.id == Solicitud.producto_id)
                      .join(Usuario, Usuario.id == Solicitud.usuario_id)
                      .order_by(Solicitud.id.desc())).all()
    return [{**request.__dict__, 'producto': product_name, 'cliente': first_name, 'apellido': last_name, 'email': email}
            for request, product_name, first_name, last_name, email in rows]


@app.patch('/api/solicitudes/{request_id}/estado')
def actualizar_estado_solicitud(request_id: int, data: SolicitudEstadoUpdate, db: Session = Depends(get_db), _: Usuario = Depends(require_roles('admin', 'empleado'))):
    request = db.get(Solicitud, request_id)
    if not request:
        raise HTTPException(status_code=404, detail='Solicitud no encontrada')
    request.estado = data.estado
    db.commit()
    return {'mensaje': 'Estado de la solicitud actualizado correctamente'}
