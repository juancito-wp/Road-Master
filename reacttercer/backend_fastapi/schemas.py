from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


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
