import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Registro de nuevos usuarios
export const registrarUsuario = async (req, res) => {
  const { nombre, apellido, tipoDocumento, numeroDocumento, direccion, telefono, email, password } = req.body;

  if (!nombre?.trim() || !apellido?.trim() || !tipoDocumento || !numeroDocumento || !direccion?.trim() || !telefono || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Correo o contraseña no válidos' });
  }
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,80}$/.test(nombre.trim()) || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,80}$/.test(apellido.trim()) || direccion.trim().length > 180 || email.trim().length > 160 || password.length > 50) {
    return res.status(400).json({ error: 'Los datos superan los límites permitidos' });
  }
  if (!/^\d{6,12}$/.test(numeroDocumento) || !/^\d{7,10}$/.test(telefono)) {
    return res.status(400).json({ error: 'Documento o teléfono no válidos' });
  }

  try {
    const [userExists] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, email, password, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre.trim(), apellido.trim(), tipoDocumento, numeroDocumento, direccion.trim(), telefono, email.trim().toLowerCase(), hashedPassword, 'cliente']
    );

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El correo o documento ya está registrado' });
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Inicio de sesión (Login)
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND estado = \'activo\'', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = users[0];
    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Firmar JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        tipoDocumento: usuario.tipo_documento,
        numeroDocumento: usuario.numero_documento,
        direccion: usuario.direccion,
        telefono: usuario.telefono,
        email: usuario.email,
        rol: usuario.rol,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error durante el inicio de sesión' });
  }
};