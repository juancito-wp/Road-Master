import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
import bcrypt
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from .models import Usuario

bearer = HTTPBearer(auto_error=False)
SECRET_KEY = os.getenv('JWT_SECRET', 'local-development-secret-change-me')
ALGORITHM = 'HS256'


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def create_token(user: Usuario) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        hours=int(os.getenv('JWT_EXPIRE_HOURS', '8'))
    )
    return jwt.encode(
        {'id': user.id, 'rol': user.rol, 'nombre': user.nombre, 'exp': expires},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_reset_token(user: Usuario) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    return jwt.encode(
        {'id': user.id, 'type': 'password-reset', 'exp': expires},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_reset_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get('type') != 'password-reset' or not payload.get('id'):
            raise JWTError
        return int(payload['id'])
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='El enlace de recuperación no es válido o expiró')


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Acceso denegado: No se proporcionó un token')
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('id')
        if not user_id:
            raise JWTError
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token inválido o expirado')
    user = db.get(Usuario, user_id)
    if not user or user.estado != 'activo':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Usuario no disponible')
    return user


def require_roles(*roles: str):
    def dependency(user: Usuario = Depends(get_current_user)) -> Usuario:
        if user.rol not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'Acceso denegado: Se requiere rol de [{", ".join(roles)}]')
        return user
    return dependency
