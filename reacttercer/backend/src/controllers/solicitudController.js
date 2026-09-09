import pool from '../config/db.js';

export const crearSolicitud = async (req, res) => {
  const { modeloId, tipoServicio, comentarios } = req.body;
  if (!modeloId || !tipoServicio || String(comentarios || '').length > 1000) {
    return res.status(400).json({ error: 'Los datos de la solicitud no son válidos' });
  }

  try {
    const [resultado] = await pool.query(
      'INSERT INTO solicitudes (usuario_id, producto_id, tipo_servicio, comentarios) VALUES (?, ?, ?, ?)',
      [req.usuario.id, modeloId, tipoServicio, comentarios || null]
    );
    res.status(201).json({ id: resultado.insertId, mensaje: 'Solicitud enviada correctamente' });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).json({ error: 'El modelo seleccionado no existe' });
    res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
};

export const obtenerSolicitudes = async (req, res) => {
  try {
    const [solicitudes] = await pool.query(
      `SELECT s.*, p.nombre AS producto, u.nombre AS cliente, u.apellido, u.email
       FROM solicitudes s
       JOIN productos p ON p.id = s.producto_id
       JOIN usuarios u ON u.id = s.usuario_id
       ORDER BY s.creado_en DESC`
    );
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar las solicitudes' });
  }
};

export const actualizarEstadoSolicitud = async (req, res) => {
  const estadosValidos = ['pendiente', 'atendida', 'cancelada'];
  const { estado } = req.body;

  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'El estado debe ser pendiente, atendida o cancelada' });
  }

  try {
    const [resultado] = await pool.query(
      'UPDATE solicitudes SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );

    if (!resultado.affectedRows) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json({ mensaje: 'Estado de la solicitud actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado de la solicitud' });
  }
};
