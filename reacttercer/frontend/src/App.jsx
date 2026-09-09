import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";

// Páginas Públicas
import Index1 from "./pages/index1";
import Index2 from "./pages/index2";
import Index3 from "./pages/index3"; // Productos / Catálogo
import Index4 from "./pages/index4"; // Contacto
import Login from "./pages/login";
import RestablecerPassword from "./pages/RestablecerPassword";

// Componente de Protección por Rol
import RutaPorRol from "./components/RutaPorRol";

// Paneles según el Rol
import PanelAdmin from "./pages/panelAdmin";
import PanelCliente from "./pages/panelCliente";
import PanelUsuario from "./pages/panelUsuario";
import WhatsAppButton from "./components/WhatsAppButton";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Header />
      
      <main className="flex-1">
        <Routes>
          {/* ================= RUTAS PÚBLICAS ================= */}
          <Route path="/" element={<Index1 />} />
          <Route path="/nosotros" element={<Index2 />} />
          <Route path="/contacto" element={<Index4 />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restablecer-password" element={<RestablecerPassword />} />

          {/* El catálogo es público; la sesión solo se exige para los paneles. */}
          <Route path="/modelos" element={<Index3 />} />
          <Route path="/productos" element={<Index3 />} />

          {/* ================= RUTA EXCLUSIVA: CLIENTE ================= */}
          <Route element={<RutaPorRol rolesPermitidos={["cliente"]} />}>
            <Route path="/mi-cuenta" element={<PanelCliente />} />
          </Route>

          {/* ================= RUTA EXCLUSIVA: USUARIO ================= */}
          <Route element={<RutaPorRol rolesPermitidos={["empleado"]} />}>
            <Route path="/panel-empleado" element={<PanelUsuario />} />
            <Route path="/panel-usuario" element={<PanelUsuario />} />
          </Route>

          {/* ================= RUTA EXCLUSIVA: ADMINISTRADOR ================= */}
          <Route element={<RutaPorRol rolesPermitidos={["admin"]} />}>
            <Route path="/admin" element={<PanelAdmin />} />
          </Route>

          {/* ================= REDIRECCIÓN SI LA RUTA NO EXISTE ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}