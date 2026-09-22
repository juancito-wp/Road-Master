import axios from 'axios';

// La API de FastAPI se sirve siempre bajo /api. Si VITE_API_URL se configura sin ese
// sufijo (error facil de cometer en Railway), el SPA llamaria a /auth/login en vez de
// /api/auth/login y recibiria un 404 que la interfaz muestra como
// "Error al conectar con el servidor." Aqui se normaliza el valor.
const urlConfigurada = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
  .trim()
  .replace(/\/+$/, '');
const baseURL = urlConfigurada.endsWith('/api') ? urlConfigurada : `${urlConfigurada}/api`;

const API = axios.create({
  baseURL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;