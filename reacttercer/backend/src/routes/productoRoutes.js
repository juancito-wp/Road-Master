import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verificarToken, permitirRoles } from '../middlewares/authMiddleware.js';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productoController.js';

const router = Router();
const carpetaUploads = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
fs.mkdirSync(carpetaUploads, { recursive: true });
const almacenamiento = multer.diskStorage({
  destination: carpetaUploads,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`);
  },
});
const subirImagen = multer({
  storage: almacenamiento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];
    const extension = path.extname(file.originalname).toLowerCase();
    if (extensionesPermitidas.includes(extension) || file.mimetype.startsWith('image/')) {
      callback(null, true);
      return;
    }
    callback(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

router.get('/', obtenerProductos);
router.post('/', verificarToken, permitirRoles('admin'), subirImagen.single('imagen'), crearProducto);
router.put('/:id', verificarToken, permitirRoles('admin'), subirImagen.single('imagen'), actualizarProducto);
router.delete('/:id', verificarToken, permitirRoles('admin'), eliminarProducto);

export default router;
