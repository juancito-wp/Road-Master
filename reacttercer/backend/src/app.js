import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import servicioRoutes from './routes/servicioRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import solicitudRoutes from './routes/solicitudRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const directorioBackend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(directorioBackend, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/modelos', productoRoutes);
app.use('/api/solicitudes', solicitudRoutes);

app.use((error, req, res, next) => {
	if (error instanceof Error && error.message.includes('imágenes')) {
		return res.status(400).json({ error: error.message });
	}
	if (error?.code === 'LIMIT_FILE_SIZE') {
		return res.status(413).json({ error: 'La imagen no puede superar 5 MB' });
	}
	next(error);
});

export default app;
