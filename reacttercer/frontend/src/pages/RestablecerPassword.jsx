import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import logoRoadMaster from "../assets/Logo road master.png";
import { Eye, EyeOff } from "lucide-react";

export default function RestablecerPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const enviar = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    try {
      setCargando(true);
      const response = await API.post("/auth/restablecer-password", {
        token: params.get("token") || "",
        nuevaPassword: password,
      });
      setMensaje(response.data.mensaje);
      setPassword("");
      setConfirmar("");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "El enlace no es válido o expiró.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <img src={logoRoadMaster} alt="Road Master" className="mx-auto mb-6 h-20 w-20 object-contain" />
        <h1 className="text-center text-3xl font-black">Nueva contraseña</h1>
        <p className="mt-3 text-center text-slate-400">Establece una contraseña segura para tu cuenta.</p>
        <form onSubmit={enviar} className="mt-8 space-y-4">
          <div className="relative"><input type={mostrarPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nueva contraseña" maxLength={50} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500" /><button type="button" onClick={() => setMostrarPassword((visible) => !visible)} aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-3 text-slate-400 hover:text-white">{mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          <div className="relative"><input type={mostrarConfirmacion ? "text" : "password"} value={confirmar} onChange={(event) => setConfirmar(event.target.value)} placeholder="Confirmar contraseña" maxLength={50} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500" /><button type="button" onClick={() => setMostrarConfirmacion((visible) => !visible)} aria-label={mostrarConfirmacion ? "Ocultar confirmación" : "Mostrar confirmación"} className="absolute right-3 top-3 text-slate-400 hover:text-white">{mostrarConfirmacion ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {mensaje && <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">{mensaje}</p>}
          <button disabled={cargando || !params.get("token")} className="w-full rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-50">{cargando ? "Actualizando..." : "Actualizar contraseña"}</button>
          <Link to="/login" className="block text-center text-sm font-semibold text-red-400 hover:text-red-300">Volver al inicio de sesión</Link>
        </form>
      </section>
    </main>
  );
}