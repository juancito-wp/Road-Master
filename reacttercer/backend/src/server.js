import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/db.js';

dotenv.config();

// Prueba rápida de conexión a la base de datos
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.json({ status: 'OK', mensaje: 'Conexión exitosa', resultado: rows[0].resultado });
  } catch (error) {
    console.error('Error MySQL:', error.message); // Muestra la causa real en consola
    res.status(500).json({ error: 'Error al conectar con la base de datos SQL', detalle: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});