import pool from '../config/db.js';

export const obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, apellido, tipo_documento, numero_documento, direccion, telefono, email, rol, estado, creado_en FROM usuarios ORDER BY id DESC'
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar los usuarios' });
  }
};

export const actualizarPerfil = async (req, res) => {
  const { nombre, apellido, direccion, telefono } = req.body;
  if (!nombre?.trim() || !apellido?.trim() || !direccion?.trim() || !/^\d{7,10}$/.test(telefono || '')) {
    return res.status(400).json({ error: 'Los datos del perfil no son válidos' });
  }

  try {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, direccion = ?, telefono = ? WHERE id = ?',
      [nombre.trim(), apellido.trim(), direccion.trim(), telefono, req.usuario.id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

export const cambiarEstadoUsuario = async (req, res) => {
  const estado = req.body.estado === 'activo' ? 'activo' : req.body.estado === 'inactivo' ? 'inactivo' : null;
  if (!estado) return res.status(400).json({ error: 'El estado debe ser activo o inactivo' });

  try {
    const [resultado] = await pool.query('UPDATE usuarios SET estado = ? WHERE id = ?', [estado, req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
  }
};

export const actualizarUsuario = async (req, res) => {
  const { nombre, apellido, tipoDocumento, numeroDocumento, direccion, telefono, email, rol } = req.body;
  const rolesValidos = ['admin', 'empleado', 'cliente'];
  if (!nombre?.trim() || !apellido?.trim() || !tipoDocumento || !/^\d{6,12}$/.test(numeroDocumento || '') || !direccion?.trim() || !/^\d{7,10}$/.test(telefono || '') || !/^\S+@\S+\.\S+$/.test(email || '') || !rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'Los datos del usuario no son válidos' });
  }

  try {
    const [resultado] = await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, tipo_documento = ?, numero_documento = ?, direccion = ?, telefono = ?, email = ?, rol = ? WHERE id = ?',
      [nombre.trim(), apellido.trim(), tipoDocumento, numeroDocumento, direccion.trim(), telefono, email.trim().toLowerCase(), rol, req.params.id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El correo o documento ya está registrado' });
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
