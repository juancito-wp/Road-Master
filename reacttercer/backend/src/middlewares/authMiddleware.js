import jwt from 'jsonwebtoken';

// 1. Verificar si el usuario envió un token válido
export const verificarToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];

  if (!tokenHeader) {
    return res.status(403).json({ error: 'Acceso denegado: No se proporcionó un token' });
  }

  // El token suele enviarse en formato "Bearer <TOKEN>"
  const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.split(' ')[1] : tokenHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Guardamos los datos del usuario en la petición
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// 2. Verificar el rol del usuario para autorizar acceso
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: `Acceso denegado: Se requiere rol de [${rolesPermitidos.join(', ')}]` 
      });
    }
    next();
  };
};