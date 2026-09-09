import { Navigate, Outlet } from "react-router-dom";

export default function RutaPorRol({ rolesPermitidos }) {
  const token = localStorage.getItem("token");
  const rolUsuario = localStorage.getItem("rolUsuario");

  // 1. Si no hay token guardado, redirige al Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si el rol del usuario no está dentro de los roles permitidos, redirige a Inicio
  if (!rolesPermitidos.includes(rolUsuario)) {
    return <Navigate to="/" replace />;
  }

  // 3. Si cumple con la autenticación y el rol, renderiza las rutas hijas
  return <Outlet />;
}