import pool from '../config/db.js';

const camposProducto = ['nombre', 'marca', 'precio', 'categoria', 'imagen', 'descripcion'];

const validarProducto = ({ nombre, precio }) => {
  if (!nombre || nombre.trim().length < 2 || nombre.trim().length > 120) {
    return 'El nombre debe tener entre 2 y 120 caracteres';
  }
  if (precio === undefined || precio === '' || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return 'El precio debe ser un número mayor o igual a cero';
  }
  return null;
};

export const obtenerProductos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

export const crearProducto = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Debes seleccionar una imagen JPG, PNG o WEBP' });
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const datos = camposProducto.map((campo) => campo === 'imagen'
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : req.body[campo] ?? null);
    const [resultado] = await pool.query(
      `INSERT INTO productos (nombre, marca, precio, categoria, imagen, descripcion, potencia, motor, transmision, aplicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [...datos, req.body.potencia || null, req.body.motor || null, req.body.transmision || null, req.body.aplicacion || null]
    );
    res.status(201).json({ id: resultado.insertId, mensaje: 'Producto creado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

export const actualizarProducto = async (req, res) => {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const [resultado] = await pool.query(
      `UPDATE productos SET nombre = ?, marca = ?, precio = ?, categoria = ?, imagen = COALESCE(?, imagen), descripcion = ?, potencia = ?, motor = ?, transmision = ?, aplicacion = ? WHERE id = ?`,
      [req.body.nombre, req.body.marca || null, req.body.precio, req.body.categoria || null, req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null, req.body.descripcion || null, req.body.potencia || null, req.body.motor || null, req.body.transmision || null, req.body.aplicacion || null, req.params.id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

export const eliminarProducto = async (req, res) => {
  try {
    const [resultado] = await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};
