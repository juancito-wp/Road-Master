import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendAssetsDir = path.resolve(backendDir, '../frontend/src/assets');
const uploadsDir = path.join(backendDir, 'uploads');
const publicBaseUrl = 'http://localhost:5000/uploads';

const modelos = [
  { nombre: 'Road Master 01', archivo: 'descarga.jpg', descripcion: 'Tractocamión diseñado para ofrecer potencia, rendimiento y confiabilidad en largas jornadas.', potencia: '500 HP', motor: '13 L', transmision: 'Automática', aplicacion: 'Larga distancia' },
  { nombre: 'Road Master 02', archivo: '4 manos.jpg', descripcion: 'Una solución de transporte pensada para enfrentar grandes recorridos y diferentes condiciones de carretera.', potencia: '550 HP', motor: '15 L', transmision: 'Manual de 18 velocidades', aplicacion: 'Carga pesada' },
  { nombre: 'Road Master 03', archivo: 'international ranchera.jpg', descripcion: 'Diseño y tecnología orientados a conseguir un excelente desempeño en el transporte pesado.', potencia: '480 HP', motor: '12.7 L', transmision: 'Manual de 18 velocidades', aplicacion: 'Transporte nacional' },
  { nombre: 'Road Master 04', archivo: 'international Eagle 9400i.jpg', descripcion: 'Un modelo preparado para ofrecer estabilidad, resistencia y eficiencia durante el trabajo.', potencia: '520 HP', motor: '13 L', transmision: 'Manual de 18 velocidades', aplicacion: 'Operación regional' },
  { nombre: 'Road Master 05', archivo: 'international 4700.jpg', descripcion: 'Potencia y confiabilidad para operaciones de transporte que requieren un alto desempeño.', potencia: '600 HP', motor: '15 L', transmision: 'Manual de 13 velocidades', aplicacion: 'Carga pesada' },
  { nombre: 'Road Master 06', archivo: 'gmc.jpg', descripcion: 'Una propuesta enfocada en rendimiento, comodidad y tecnología para largas distancias.', potencia: '530 HP', motor: '13 L', transmision: 'Manual de 18 velocidades', aplicacion: 'Larga distancia' },
];

try {
  for (const columna of ['potencia', 'motor', 'transmision', 'aplicacion']) {
    const [columnas] = await pool.query(
      `SELECT COUNT(*) AS cantidad FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos' AND COLUMN_NAME = ?`,
      [columna]
    );
    if (!columnas[0].cantidad) {
      const tipos = { potencia: 'VARCHAR(40)', motor: 'VARCHAR(40)', transmision: 'VARCHAR(80)', aplicacion: 'VARCHAR(100)' };
      await pool.query(`ALTER TABLE productos ADD COLUMN ${columna} ${tipos[columna]}`);
    }
  }
  await fs.mkdir(uploadsDir, { recursive: true });
  for (const modelo of modelos) {
    const extension = path.extname(modelo.archivo).toLowerCase();
    const nombreArchivo = `modelo-${modelo.nombre.toLowerCase().replaceAll(' ', '-')}${extension}`;
    await fs.copyFile(path.join(frontendAssetsDir, modelo.archivo), path.join(uploadsDir, nombreArchivo));
    const imagen = `${publicBaseUrl}/${nombreArchivo}`;

    const [existentes] = await pool.query('SELECT id FROM productos WHERE nombre = ? LIMIT 1', [modelo.nombre]);
    if (existentes.length) {
      await pool.query(
        'UPDATE productos SET marca = ?, imagen = ?, descripcion = ?, potencia = ?, motor = ?, transmision = ?, aplicacion = ? WHERE id = ?',
        ['Road Master', imagen, modelo.descripcion, modelo.potencia, modelo.motor, modelo.transmision, modelo.aplicacion, existentes[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO productos (nombre, marca, precio, categoria, imagen, descripcion, potencia, motor, transmision, aplicacion) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?)',
        [modelo.nombre, 'Road Master', 'Tractocamión', imagen, modelo.descripcion, modelo.potencia, modelo.motor, modelo.transmision, modelo.aplicacion]
      );
    }
    console.log(`Modelo cargado: ${modelo.nombre}`);
  }
} finally {
  await pool.end();
}
