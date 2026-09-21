from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Usuario(Base):
    __tablename__ = 'usuarios'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(80))
    apellido: Mapped[str] = mapped_column(String(80))
    tipo_documento: Mapped[str] = mapped_column(String(20))
    numero_documento: Mapped[str] = mapped_column(String(12), unique=True)
    direccion: Mapped[str] = mapped_column(String(180))
    telefono: Mapped[str] = mapped_column(String(10))
    email: Mapped[str] = mapped_column(String(160), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    rol: Mapped[str] = mapped_column(String(30), default='cliente')
    estado: Mapped[str] = mapped_column(String(10), default='activo')
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Producto(Base):
    __tablename__ = 'productos'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    marca: Mapped[str | None] = mapped_column(String(80), nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    categoria: Mapped[str | None] = mapped_column(String(80), nullable=True)
    imagen: Mapped[str | None] = mapped_column(String(500), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    potencia: Mapped[str | None] = mapped_column(String(40), nullable=True)
    motor: Mapped[str | None] = mapped_column(String(40), nullable=True)
    transmision: Mapped[str | None] = mapped_column(String(80), nullable=True)
    aplicacion: Mapped[str | None] = mapped_column(String(100), nullable=True)
    estado: Mapped[str] = mapped_column(String(10), default='activo')
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Servicio(Base):
    __tablename__ = 'servicios'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    estado: Mapped[str] = mapped_column(String(10), default='activo')
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Solicitud(Base):
    __tablename__ = 'solicitudes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey('usuarios.id'))
    producto_id: Mapped[int] = mapped_column(ForeignKey('productos.id'))
    tipo_servicio: Mapped[str] = mapped_column(String(80))
    comentarios: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    estado: Mapped[str] = mapped_column(String(20), default='pendiente')
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Venta(Base):
    __tablename__ = 'ventas'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey('usuarios.id'))
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey('usuarios.id'), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    descuento: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    impuesto: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    estado: Mapped[str] = mapped_column(String(20), default='pendiente')
    observaciones: Mapped[str | None] = mapped_column(String(500), nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DetalleVenta(Base):
    __tablename__ = 'detalle_ventas'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    venta_id: Mapped[int] = mapped_column(ForeignKey('ventas.id'))
    producto_id: Mapped[int | None] = mapped_column(ForeignKey('productos.id'), nullable=True)
    servicio_id: Mapped[int | None] = mapped_column(ForeignKey('servicios.id'), nullable=True)
    tipo: Mapped[str] = mapped_column(String(10), default='producto')
    descripcion: Mapped[str] = mapped_column(String(160))
    cantidad: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=1)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    descuento: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)


class Factura(Base):
    __tablename__ = 'facturas'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    numero: Mapped[str] = mapped_column(String(30), unique=True)
    venta_id: Mapped[int] = mapped_column(ForeignKey('ventas.id'), unique=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey('usuarios.id'))
    fecha: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    impuesto: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    estado: Mapped[str] = mapped_column(String(20), default='emitida')
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DetalleFactura(Base):
    __tablename__ = 'detalle_facturas'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    factura_id: Mapped[int] = mapped_column(ForeignKey('facturas.id'))
    descripcion: Mapped[str] = mapped_column(String(160))
    cantidad: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=1)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)


class Pqr(Base):
    __tablename__ = 'pqr'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey('usuarios.id'))
    tipo: Mapped[str] = mapped_column(String(20), default='peticion')
    asunto: Mapped[str] = mapped_column(String(160))
    descripcion: Mapped[str] = mapped_column(Text)
    estado: Mapped[str] = mapped_column(String(20), default='pendiente')
    respuesta: Mapped[str | None] = mapped_column(Text, nullable=True)
    atendido_por: Mapped[int | None] = mapped_column(ForeignKey('usuarios.id'), nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    actualizado_en: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Conversacion(Base):
    __tablename__ = 'conversaciones'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sesion: Mapped[str] = mapped_column(String(64), unique=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey('usuarios.id'), nullable=True)
    titulo: Mapped[str | None] = mapped_column(String(160), nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Mensaje(Base):
    __tablename__ = 'mensajes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    conversacion_id: Mapped[int] = mapped_column(ForeignKey('conversaciones.id'))
    rol: Mapped[str] = mapped_column(String(16), default='user')
    contenido: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
