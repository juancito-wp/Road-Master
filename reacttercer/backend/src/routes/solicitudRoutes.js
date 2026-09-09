import { Router } from 'express';
import { verificarToken, permitirRoles } from '../middlewares/authMiddleware.js';
import {
  crearSolicitud,
  obtenerSolicitudes,
  actualizarEstadoSolicitud,
} from '../controllers/solicitudController.js';

const router = Router();

router.post('/', verificarToken, permitirRoles('cliente'), crearSolicitud);
router.get('/', verificarToken, permitirRoles('admin', 'empleado'), obtenerSolicitudes);
router.patch('/:id/estado', verificarToken, permitirRoles('admin', 'empleado'), actualizarEstadoSolicitud);

export default router;
