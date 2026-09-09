import { useState } from "react";
import API from "../api/axios";
import { Eye, EyeOff } from "lucide-react";

export default function RecuperarPassword({ cerrar }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState("correo");
  const [codigo, setCodigo] = useState("");
  const [token, setToken] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // ==============================
  // CAMBIO DEL CORREO
  // ==============================

  const manejarCambio = (e) => {
    const valor = e.target.value;

    setEmail(valor);
    setMensaje("");

    if (!valor.trim()) {
      setError("El correo electrónico es obligatorio.");
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    ) {
      setError("Ingresa un correo electrónico válido.");
    } else {
      setError("");
    }
  };

  // ==============================
  // RECUPERAR CONTRASEÑA
  // ==============================

  const recuperar = async (e) => {
    e.preventDefault();

    setMensaje("");

    // Validar correo vacío
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    // Validar formato
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    try {
      setCargando(true);
      const respuesta = await API.post("/auth/recuperar-password", {
        email: email.trim().toLowerCase(),
      });
      setError("");
      setMensaje(respuesta.data.mensaje);
      setPaso("codigo");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo comprobar el correo.");
    } finally {
      setCargando(false);
    }
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo)) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    try {
      setCargando(true);
      const respuesta = await API.post("/auth/verificar-codigo", {
        email: email.trim().toLowerCase(), codigo,
      });
      setToken(respuesta.data.token);
      setPaso("password");
      setMensaje("Código verificado. Define tu nueva contraseña.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "El código es incorrecto o expiró.");
    } finally {
      setCargando(false);
    }
  };

  const restablecer = async (e) => {
    e.preventDefault();
    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setCargando(true);
      const respuesta = await API.post("/auth/restablecer-password", {
        token, nuevaPassword,
      });
      setMensaje(respuesta.data.mensaje);
      setError("");
      setPaso("finalizado");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar la contraseña.");
    } finally {
      setCargando(false);
    }
  };


  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      onClick={cerrar}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ==============================
            TÍTULO
        ============================== */}

        <div className="mb-6 text-center">

          <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Road Master
          </span>

          <h2 className="mt-3 text-3xl font-black text-white">
            Recuperar contraseña
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Ingresa el correo electrónico de tu cuenta
            para comprobar si está registrado.
          </p>

        </div>


        {/* ==============================
            FORMULARIO
        ============================== */}

        <form onSubmit={paso === "correo" ? recuperar : paso === "codigo" ? verificarCodigo : restablecer}>

          <label
            htmlFor="recover-email"
            className="mb-2 block text-sm font-semibold text-slate-300"
          >
            {paso === "correo" ? "Correo electrónico" : paso === "codigo" ? "Código de recuperación" : "Nueva contraseña"}
          </label>

          {paso === "correo" && <input id="recover-email" name="email" type="email" value={email} onChange={manejarCambio} placeholder="correo@ejemplo.com" maxLength={100} className={`w-full rounded-lg border ${error ? "border-red-500" : "border-white/10"} bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`} />}
          {paso === "codigo" && <input id="recovery-code" inputMode="numeric" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-full text-center text-2xl font-black tracking-[0.5em] rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500" />}
          {paso === "password" && <div className="space-y-3"><div className="relative"><input type={mostrarNuevaPassword ? "text" : "password"} value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} placeholder="Nueva contraseña" maxLength={50} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500" /><button type="button" onClick={() => setMostrarNuevaPassword((visible) => !visible)} aria-label={mostrarNuevaPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-3 text-slate-400 hover:text-white">{mostrarNuevaPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div><div className="relative"><input type={mostrarConfirmacion ? "text" : "password"} value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} placeholder="Confirmar nueva contraseña" maxLength={50} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500" /><button type="button" onClick={() => setMostrarConfirmacion((visible) => !visible)} aria-label={mostrarConfirmacion ? "Ocultar confirmación" : "Mostrar confirmación"} className="absolute right-3 top-3 text-slate-400 hover:text-white">{mostrarConfirmacion ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>}

          {/* ==============================
              ERROR
          ============================== */}

          {error && (
            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* ==============================
              MENSAJE EXITOSO
          ============================== */}

          {mensaje && (
            <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {mensaje}
            </div>
          )}


          {/* ==============================
              BOTÓN RECUPERAR
          ============================== */}

          <button
            type="submit"
            disabled={cargando || paso === "finalizado"}
            className="mt-6 w-full rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
          >
            {cargando ? "Procesando..." : paso === "correo" ? "Enviar código" : paso === "codigo" ? "Verificar código" : paso === "password" ? "Actualizar contraseña" : "Contraseña actualizada"}
          </button>


          {/* ==============================
              CERRAR
          ============================== */}

          <button
            type="button"
            onClick={cerrar}
            className="mt-3 w-full rounded-lg border border-white/10 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Regresar al inicio de sesión
          </button>

        </form>

      </div>
    </div>
  );
}