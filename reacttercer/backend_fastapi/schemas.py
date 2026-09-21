from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class UsuarioBase(BaseModel):
    nombre: str = Field(min_length=3, max_length=80)
    apellido: str = Field(min_length=3, max_length=80)
    tipoDocumento: str = Field(min_length=2, max_length=20)
    numeroDocumento: str = Field(pattern=r'^\d{6,12}$')
    direccion: str = Field(min_length=3, max_length=180)
    telefono: str = Field(pattern=r'^\d{7,10}$')
    email: EmailStr

    @field_validator('nombre', 'apellido', 'direccion')
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()


class RegistroUsuario(UsuarioBase):
    password: str = Field(min_length=8, max_length=50)


class UsuarioCreate(RegistroUsuario):
    rol: str = Field(default='cliente', pattern=r'^(admin|empleado|cliente)$')


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RecuperarPasswordRequest(BaseModel):
    email: EmailStr


class VerificarCodigoRequest(BaseModel):
    email: EmailStr
    codigo: str = Field(pattern=r'^\d{6}$')


class RestablecerPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    nuevaPassword: str = Field(min_length=8, max_length=50)


class UsuarioUpdate(UsuarioBase):
    rol: str = Field(pattern=r'^(admin|empleado|cliente)$')


class PerfilUpdate(BaseModel):
    nombre: str = Field(min_length=3, max_length=80)
    apellido: str = Field(min_length=3, max_length=80)
    direccion: str = Field(min_length=3, max_length=180)
    telefono: str = Field(pattern=r'^\d{7,10}$')


class EstadoUpdate(BaseModel):
    estado: str = Field(pattern=r'^(activo|inactivo)$')


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    apellido: str
    tipoDocumento: str = Field(validation_alias='tipo_documento')
    numeroDocumento: str = Field(validation_alias='numero_documento')
    direccion: str
    telefono: str
    email: EmailStr
    rol: str
    estado: str


class ProductoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nombre: str
    marca: Optional[str] = None
    precio: Decimal
    categoria: Optional[str] = None
    imagen: Optional[str] = None
    descripcion: Optional[str] = None
    potencia: Optional[str] = None
    motor: Optional[str] = None
    transmision: Optional[str] = None
    aplicacion: Optional[str] = None
    estado: str


class ServicioRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    descripcion: Optional[str] = None
    precio: Decimal = Field(ge=0)


class ServicioResponse(ServicioRequest):
    model_config = ConfigDict(from_attributes=True)
    id: int
    estado: str


class SolicitudEstadoUpdate(BaseModel):
    estado: str = Field(pattern=r'^(pendiente|atendida|cancelada)$')


# ==========================================================
# Ventas
# ==========================================================
class DetalleVentaRequest(BaseModel):
    productoId: Optional[int] = None
    servicioId: Optional[int] = None
    descripcion: Optional[str] = Field(default=None, max_length=160)
    cantidad: Decimal = Field(gt=0, default=1)
    precioUnitario: Optional[Decimal] = Field(default=None, ge=0)
    descuento: Decimal = Field(default=0, ge=0)

    @model_validator(mode='after')
    def validar_item(self):
        if not self.productoId and not self.servicioId:
            raise ValueError('Cada detalle debe incluir un producto o un servicio')
        if self.productoId and self.servicioId:
            raise ValueError('Un detalle no puede incluir producto y servicio al mismo tiempo')
        return self


class VentaRequest(BaseModel):
    clienteId: Optional[int] = None
    usuarioId: Optional[int] = None
    items: list[DetalleVentaRequest] = Field(min_length=1)
    descuento: Decimal = Field(default=0, ge=0)
    impuestoPorcentaje: Optional[Decimal] = Field(default=None, ge=0, le=100)
    estado: str = Field(default='pendiente', pattern=r'^(pendiente|pagada|anulada)$')
    observaciones: Optional[str] = Field(default=None, max_length=500)


class VentaEstadoUpdate(BaseModel):
    estado: str = Field(pattern=r'^(pendiente|pagada|anulada)$')


# ==========================================================
# Facturas
# ==========================================================
class FacturaRequest(BaseModel):
    ventaId: int
    impuestoPorcentaje: Optional[Decimal] = Field(default=None, ge=0, le=100)


class FacturaEstadoUpdate(BaseModel):
    estado: str = Field(pattern=r'^(emitida|pagada|anulada)$')


# ==========================================================
# PQR
# ==========================================================
class PqrRequest(BaseModel):
    tipo: str = Field(pattern=r'^(peticion|queja|reclamo|sugerencia)$')
    asunto: str = Field(min_length=5, max_length=160)
    descripcion: str = Field(min_length=10, max_length=2000)

    @field_validator('asunto', 'descripcion')
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()


class PqrEstadoUpdate(BaseModel):
    estado: str = Field(pattern=r'^(pendiente|en proceso|respondida|cerrada)$')


class PqrRespuestaRequest(BaseModel):
    respuesta: str = Field(min_length=5, max_length=2000)
    estado: str = Field(default='respondida', pattern=r'^(pendiente|en proceso|respondida|cerrada)$')


# ==========================================================
# Chatbot
# ==========================================================
class ChatMensaje(BaseModel):
    rol: str = Field(pattern=r'^(user|assistant)$')
    contenido: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    mensaje: str = Field(min_length=1, max_length=2000)
    sesion: Optional[str] = Field(default=None, max_length=64)
    historial: list[ChatMensaje] = Field(default_factory=list, max_length=20)
