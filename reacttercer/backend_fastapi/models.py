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
