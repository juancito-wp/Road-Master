import bcrypt from 'bcrypt';
import pool from './config/db.js';

const usuariosDemo = [
  { nombre: 'Admin', apellido: 'Road Master', email: 'admin@roadmaster.com', rol: 'admin', documento: '100000001', password: 'Admin123!' },
  { nombre: 'Empleado', apellido: 'Road Master', email: 'empleado@roadmaster.com', rol: 'empleado', documento: '100000002', password: 'Empleado123!' },
  { nombre: 'Cliente', apellido: 'Road Master', email: 'cliente@roadmaster.com', rol: 'cliente', documento: '100000003', password: 'Cliente123!' },
];

try {
  for (const usuario of usuariosDemo) {
    const hash = await bcrypt.hash(usuario.password, 10);
    await pool.query(
      `INSERT INTO usuarios
        (nombre, apellido, tipo_documento, numero_documento, direccion, telefono, email, password, rol, estado)
       VALUES (?, ?, 'CC', ?, 'Calle 1 # 1-1', '3000000000', ?, ?, ?, 'activo')
       ON DUPLICATE KEY UPDATE password = VALUES(password), rol = VALUES(rol), estado = 'activo'`,
      [usuario.nombre, usuario.apellido, usuario.documento, usuario.email, hash, usuario.rol]
    );
    console.log(`${usuario.rol}: ${usuario.email}`);
  }
} finally {
  await pool.end();
}
