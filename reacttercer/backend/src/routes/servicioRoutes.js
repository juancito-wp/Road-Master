import { Router } from 'express';
import { obtenerServicios, crearServicio, actualizarServicio, eliminarServicio } from '../controllers/servicioController.js';
import { verificarToken, permitirRoles } from '../middlewares/authMiddleware.js';

const router = Router();

// Cualquiera con token puede listar los servicios
router.get('/', verificarToken, obtenerServicios);

// Solo admin y empleado pueden crear servicios
router.post('/', verificarToken, permitirRoles('admin', 'empleado'), crearServicio);
router.put('/:id', verificarToken, permitirRoles('admin', 'empleado'), actualizarServicio);

// Solo el admin puede eliminar
router.delete('/:id', verificarToken, permitirRoles('admin'), eliminarServicio);

export default router;