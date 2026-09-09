import { Router } from 'express';
import { verificarToken, permitirRoles } from '../middlewares/authMiddleware.js';
import {
  obtenerUsuarios,
  actualizarPerfil,
  cambiarEstadoUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuarioController.js';

const router = Router();

router.get('/', verificarToken, permitirRoles('admin'), obtenerUsuarios);
router.put('/perfil', verificarToken, actualizarPerfil);
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Perfil accedido con éxito',
    usuario: req.usuario
  });
});
router.put('/:id', verificarToken, permitirRoles('admin'), actualizarUsuario);
router.patch('/:id/estado', verificarToken, permitirRoles('admin'), cambiarEstadoUsuario);
router.delete('/:id', verificarToken, permitirRoles('admin'), eliminarUsuario);

// Ruta exclusiva para Administradores
router.get('/panel-admin', verificarToken, permitirRoles('admin'), (req, res) => {
  res.json({ mensaje: 'Bienvenido al panel de administración' });
});

export default router;