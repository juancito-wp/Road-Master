import pool from '../config/db.js';

// Obtener todos los servicios (Público o Autenticado)
export const obtenerServicios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM servicios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};

// Crear un servicio (Exclusivo Admin / Empleado)
export const crearServicio = async (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  if (!nombre?.trim() || nombre.trim().length > 120 || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({ error: 'Nombre o precio del servicio no válido' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, precio) VALUES (?, ?, ?)',
      [nombre, descripcion, precio]
    );
    res.status(201).json({ mensaje: 'Servicio creado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el servicio' });
  }
};

// Eliminar un servicio (Exclusivo Admin)
export const eliminarServicio = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM servicios WHERE id = ?', [id]);
    res.json({ mensaje: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  }
};

export const actualizarServicio = async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  if (!nombre?.trim() || nombre.trim().length > 120 || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({ error: 'Nombre o precio del servicio no válido' });
  }

  try {
    const [resultado] = await pool.query(
      'UPDATE servicios SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?',
      [nombre.trim(), descripcion || null, precio, req.params.id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json({ mensaje: 'Servicio actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el servicio' });
  }
};