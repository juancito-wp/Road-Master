import { useState, useEffect } from "react";
import API from "../api/axios";

export default function PanelCliente() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    direccion: "",
    telefono: "",
  });

  const [modelos, setModelos] = useState([]);
  const [cotizacion, setCotizacion] = useState({
    modeloId: "",
    tipoServicio: "Cotización",
    comentarios: "",
  });

  const [cargando, setCargando] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [mensajeCotizacion, setMensajeCotizacion] = useState("");
  const [error, setError] = useState("");

  // Cargar datos del usuario y lista de modelos al montar
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioActual") || "{}");
    setUsuario({
      nombre: usuarioGuardado.nombre || localStorage.getItem("nombreUsuario") || "",
      apellido: usuarioGuardado.apellido || "",
      email: usuarioGuardado.email || "",
      direccion: usuarioGuardado.direccion || "",
      telefono: usuarioGuardado.telefono || "",
    });

    const obtenerModelos = async () => {
      try {
        const res = await API.get("/productos");
        setModelos(res.data);
      } catch (err) {
        console.error("Error al obtener modelos para cotización", err);
      }
    };

    obtenerModelos();
  }, []);

  // Manejar cambios en formulario de perfil
  const manejarCambioPerfil = (e) => {
    const { name, value } = e.target;
    const nuevoValor = name === "telefono" ? value.replace(/\D/g, "") : value;
    setUsuario((prev) => ({ ...prev, [name]: nuevoValor }));
  };

  // Manejar cambios en formulario de cotización
  const manejarCambioCotizacion = (e) => {
    const { name, value } = e.target;
    setCotizacion((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar cambios de perfil
  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setMensajePerfil("");
    setError("");

    if (!usuario.nombre.trim() || !usuario.apellido.trim() || !usuario.direccion.trim() || !/^\d{7,10}$/.test(usuario.telefono)) {
      setError("Completa nombre, apellido, dirección y un teléfono válido de 7 a 10 dígitos.");
      return;
    }

    try {
      setCargando(true);
      await API.put("/usuarios/perfil", usuario);
      
      // Actualizar localStorage
      localStorage.setItem("nombreUsuario", usuario.nombre);
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "{}");
      localStorage.setItem("usuarioActual", JSON.stringify({ ...usuarioActual, ...usuario }));

      setMensajePerfil("Perfil actualizado correctamente.");
      setTimeout(() => setMensajePerfil(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el perfil.");
    } finally {
      setCargando(false);
    }
  };

  // Enviar solicitud de cotización
  const enviarCotizacion = async (e) => {
    e.preventDefault();
    setMensajeCotizacion("");
    setError("");

    if (!modelos.length) {
      setError("No hay modelos disponibles para realizar una solicitud en este momento.");
      return;
    }

    if (!cotizacion.modeloId) {
      setError("Selecciona un modelo válido para continuar.");
      return;
    }

    try {
      setCargando(true);
      await API.post("/solicitudes", {
        ...cotizacion,
        cliente: usuario.nombre,
        email: usuario.email,
      });

      setMensajeCotizacion("¡Solicitud enviada con éxito! Un asesor te contactará pronto.");
      setCotizacion({ modeloId: "", tipoServicio: "Cotización", comentarios: "" });
      setTimeout(() => setMensajeCotizacion(""), 4000);
    } catch (err) {
      const mensajeError = err.response?.data?.error || "Error al enviar la cotización.";
      const detalleAmigable = mensajeError.includes("no existe")
        ? "El modelo seleccionado ya no está disponible. Elige otro vehículo de la lista."
        : mensajeError.includes("válidos")
          ? "Revisa los datos de la solicitud antes de enviarla."
          : mensajeError;

      setError(detalleAmigable);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* HEADER DEL PANEL */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Mi Cuenta (Cliente)</h1>
        <p className="mt-1 text-slate-400">Gestiona tus datos personales y solicita cotizaciones de vehículos.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ================= FORMULARIO DE PERFIL ================= */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-red-500">Datos Personales</h2>
          <p className="mt-1 text-xs text-slate-400">Actualiza la información de tu cuenta.</p>

          {mensajePerfil && (
            <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {mensajePerfil}
            </div>
          )}

          <form onSubmit={actualizarPerfil} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={usuario.nombre}
                onChange={manejarCambioPerfil}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={usuario.apellido}
                onChange={manejarCambioPerfil}
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={usuario.email}
                onChange={manejarCambioPerfil}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={usuario.direccion}
                onChange={manejarCambioPerfil}
                maxLength={180}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={usuario.telefono}
                onChange={manejarCambioPerfil}
                inputMode="numeric"
                maxLength={10}
                placeholder="3000000000"
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="mt-4 w-full rounded-lg bg-red-600 py-2.5 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
            >
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* ================= FORMULARIO DE COTIZACIÓN ================= */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-red-500">Solicitar Cotización / Prueba</h2>
          <p className="mt-1 text-xs text-slate-400">Elige un modelo e inicia tu proceso de atención.</p>

          {mensajeCotizacion && (
            <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {mensajeCotizacion}
            </div>
          )}

          <form onSubmit={enviarCotizacion} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Modelo de Interés</label>
              <select
                name="modeloId"
                value={cotizacion.modeloId}
                onChange={manejarCambioCotizacion}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={!modelos.length}
              >
                <option value="">{modelos.length ? "-- Selecciona un vehículo --" : "No hay modelos disponibles"}</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} - ${Number(m.precio).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Tipo de Solicitud</label>
              <select
                name="tipoServicio"
                value={cotizacion.tipoServicio}
                onChange={manejarCambioCotizacion}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
              >
                <option value="Cotización">Cotización de Compra</option>
                <option value="Prueba de Manejo">Prueba de Manejo (Test Drive)</option>
                <option value="Financiamiento">Información de Financiamiento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Comentarios Adicionales</label>
              <textarea
                name="comentarios"
                rows="3"
                value={cotizacion.comentarios}
                onChange={manejarCambioCotizacion}
                placeholder="Indica detalles como horario preferido o dudas..."
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={cargando || !modelos.length}
              className="mt-4 w-full rounded-lg bg-red-600 py-2.5 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
            >
              {cargando ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}