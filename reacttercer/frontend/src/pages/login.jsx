import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";
import RecuperarPassword from "../components/RecuperarPassword";
import API from "../api/axios";
import logoRoadMaster from "../assets/Logo road master.png";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Intención enviada desde el catálogo público ("Cotizar este modelo")
  const intencionCotizacion =
    location.state?.seccion === "cotizacion" ? location.state : null;

  const [formulario, setFormulario] = useState({
    email: "",
    password: "",
    recordar: false,
  });

  const [errores, setErrores] = useState({});
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Si se llega desde el código QR (login?registro=1), se abre el registro automáticamente
  useEffect(() => {
    if (new URLSearchParams(location.search).get("registro") === "1") {
      setMostrarRegistro(true);
    }
  }, [location.search]);

  // ==============================
  // VALIDACIÓN LOCAL DE CAMPOS
  // ==============================

  const validarCampo = (nombre, valor) => {
    let error = "";

    if (nombre === "email") {
      if (!valor.trim()) {
        error = "El correo electrónico es obligatorio.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        error = "Ingresa un correo electrónico válido.";
      }
    }

    if (nombre === "password") {
      if (!valor) {
        error = "La contraseña es obligatoria.";
      } else if (valor.length < 8) {
        error = "La contraseña debe tener mínimo 8 caracteres.";
      }
    }

    setErrores((prev) => ({
      ...prev,
      [nombre]: error,
    }));

    setMensajeExito("");
  };

  // ==============================
  // CAMBIO DE INPUT
  // ==============================

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    const nuevoValor = type === "checkbox" ? checked : value;

    setFormulario((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));

    if (type !== "checkbox") {
      validarCampo(name, value);
    }
  };

  // ==============================
  // INICIAR SESIÓN (PETICIÓN A LA API)
  // ==============================

  const manejarLogin = async (e) => {
    e.preventDefault();
    setMensajeExito("");

    const erroresActuales = {};

    if (!formulario.email.trim()) {
      erroresActuales.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      erroresActuales.email = "Ingresa un correo electrónico válido.";
    }

    if (!formulario.password) {
      erroresActuales.password = "La contraseña es obligatoria.";
    } else if (formulario.password.length < 8) {
      erroresActuales.password = "La contraseña debe tener mínimo 8 caracteres.";
    }

    if (Object.keys(erroresActuales).length > 0) {
      setErrores(erroresActuales);
      return;
    }

    // ==============================
    // ENVÍO AL BACKEND Y MANEJO DE ROL
    // ==============================
    try {
      setCargando(true);
      setErrores({});

      const res = await API.post("/auth/login", {
        email: formulario.email.trim().toLowerCase(),
        password: formulario.password,
      });

      const usuario = res.data.usuario;
      const nombreUsuario = usuario?.nombre || "Usuario";
      // Extraemos el rol (por defecto 'cliente' si el backend no envía el campo explícito)
      const rolUsuario = usuario?.rol || "cliente";

      // Guardado de tokens y roles en localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("nombreUsuario", nombreUsuario);
      localStorage.setItem("usuarioActual", JSON.stringify(usuario));
      localStorage.setItem("rolUsuario", rolUsuario); // 👈 Guardado del ROL

      if (formulario.recordar) {
        localStorage.setItem("recordarSesion", "true");
      } else {
        localStorage.removeItem("recordarSesion");
      }

      setMensajeExito(`¡Bienvenido, ${nombreUsuario}! Redirigiendo...`);

      // Redirección condicional según el Rol tras 1.2 segundos
      setTimeout(() => {
        if (rolUsuario === "admin") {
          navigate("/admin");
        } else if (rolUsuario === "cliente") {
          if (intencionCotizacion) {
            // Regresa a la cotización con el vehículo que el cliente eligió en el catálogo
            navigate(location.state.redirectTo || "/mi-cuenta", {
              replace: true,
              state: {
                seccion: "cotizacion",
                modeloId: intencionCotizacion.modeloId ?? null,
                modeloNombre: intencionCotizacion.modeloNombre ?? null,
              },
            });
          } else {
            navigate("/mi-cuenta");
          }
        } else {
          navigate("/panel-empleado");
        }
      }, 1200);

    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Error al conectar con el servidor.";

      if (mensajeError.includes("correo") || mensajeError.includes("encontrado")) {
        setErrores({ email: mensajeError });
      } else {
        setErrores({ password: mensajeError });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ================= FONDO ================= */}
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

        {/* ================= FORMULARIO ================= */}
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <img
              src={logoRoadMaster}
              alt="Logo Road Master"
              className="mx-auto mb-5 h-24 w-24 object-contain"
            />
            <h1 className="text-4xl font-black">Iniciar sesión</h1>
            <p className="mt-3 text-slate-400">Accede a tu cuenta de Road Master.</p>
          </div>

          <form onSubmit={manejarLogin}>
            {/* ================= CORREO ================= */}
            <div className="relative mb-5">
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-300">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formulario.email}
                onChange={manejarCambio}
                placeholder="correo@ejemplo.com"
                maxLength={100}
                className={`w-full rounded-lg border ${
                  errores.email ? "border-red-500" : "border-white/10"
                } bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500`}
              />
              {errores.email && <p className="mt-2 text-sm text-red-400">{errores.email}</p>}
            </div>

            {/* ================= CONTRASEÑA ================= */}
            <div className="relative mb-5">
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type={mostrarPassword ? "text" : "password"}
                value={formulario.password}
                onChange={manejarCambio}
                placeholder="••••••••"
                maxLength={50}
                className={`w-full rounded-lg border ${
                  errores.password ? "border-red-500" : "border-white/10"
                } bg-slate-900 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500`}
              />
              <button type="button" onClick={() => setMostrarPassword((visible) => !visible)} aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-9 text-slate-400 hover:text-white">
                {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errores.password && <p className="mt-2 text-sm text-red-400">{errores.password}</p>}
            </div>

            {/* ================= MENSAJE DE ÉXITO ================= */}
            {mensajeExito && (
              <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                {mensajeExito}
              </div>
            )}

            {/* ================= OPCIONES ================= */}
            <div className="mb-6 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  name="recordar"
                  checked={formulario.recordar}
                  onChange={manejarCambio}
                  className="h-4 w-4 accent-red-600"
                />
                Recordarme
              </label>

              <button
                type="button"
                onClick={() => setMostrarRecuperar(true)}
                className="text-sm font-semibold text-red-500 transition hover:text-red-400"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* ================= BOTÓN ================= */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-red-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-1 hover:bg-red-700 disabled:opacity-50"
            >
              {cargando ? "Cargando..." : "Iniciar sesión"}
            </button>

            {/* ================= REGISTRO ================= */}
            <p className="mt-6 text-center text-sm text-slate-500">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => setMostrarRegistro(true)}
                className="font-semibold text-red-500 transition hover:text-red-400"
              >
                Crear cuenta
              </button>
            </p>
          </form>
        </div>
      </section>

      {/* ================= MODALES ================= */}
      {mostrarRegistro && <RegisterModal cerrarModal={() => setMostrarRegistro(false)} />}
      {mostrarRecuperar && <RecuperarPassword cerrar={() => setMostrarRecuperar(false)} />}
    </main>
  );
}