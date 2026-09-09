import { Navigate, Outlet } from "react-router-dom";

export default function RutaProtegida() {
  // Verificamos si existe un token almacenado
  const token = localStorage.getItem("token");

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostramos las rutas hijas (componentes protegidos)
  return <Outlet />;
}