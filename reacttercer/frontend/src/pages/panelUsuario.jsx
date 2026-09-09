import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const estados = {
  pendiente: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  atendida: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelada: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function PanelUsuario() {
  const nombre = localStorage.getItem("nombreUsuario") || "Empleado";
  const [solicitudes, setSolicitudes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [resSolicitudes, resModelos] = await Promise.all([
          API.get("/solicitudes"),
          API.get("/productos")
        ]);

        setSolicitudes(resSolicitudes.data || []);
        setModelos(resModelos.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.error || "No se pudieron cargar los datos del empleado.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    if (filtro === "todos") return solicitudes;
    return solicitudes.filter((solicitud) => solicitud.estado === filtro);
  }, [solicitudes, filtro]);

  const resumen = useMemo(() => {
    const cantidadTotal = solicitudes.length;
    const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
    const atendidas = solicitudes.filter((s) => s.estado === "atendida").length;
    const canceladas = solicitudes.filter((s) => s.estado === "cancelada").length;

    return {
      total: cantidadTotal,
      pendientes,
      atendidas,
      canceladas,
      modelos: modelos.length,
    };
  }, [solicitudes, modelos]);

  const cambiarEstado = async (id, estado) => {
    try {
      await API.patch(`/solicitudes/${id}/estado`, { estado });
      setSolicitudes((actuales) =>
        actuales.map((solicitud) =>
          solicitud.id === id ? { ...solicitud, estado } : solicitud
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el estado.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">Operación</p>
          <h1 className="mt-2 text-3xl font-black text-white">Panel de empleado</h1>
          <p className="mt-2 text-slate-400">Bienvenido, {nombre}. Aquí puedes atender solicitudes y revisar el estado del negocio.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Solicitudes</p>
          <p className="mt-3 text-3xl font-black text-white">{resumen.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Pendientes</p>
          <p className="mt-3 text-3xl font-black text-amber-400">{resumen.pendientes}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Atendidas</p>
          <p className="mt-3 text-3xl font-black text-emerald-400">{resumen.atendidas}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Canceladas</p>
          <p className="mt-3 text-3xl font-black text-red-400">{resumen.canceladas}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Modelos</p>
          <p className="mt-3 text-3xl font-black text-red-400">{resumen.modelos}</p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Solicitudes de clientes</h2>
            <p className="text-sm text-slate-400">Revisa las peticiones de cotización y gestión del servicio.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['todos', 'pendiente', 'atendida', 'cancelada'].map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltro(estado)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  filtro === estado
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-white/10 bg-slate-950 text-slate-300 hover:border-red-500/40"
                }`}
              >
                {estado === "todos" ? "Todas" : estado}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="py-10 text-center text-slate-400">Cargando solicitudes...</div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="py-10 text-center text-slate-400">No hay solicitudes para este filtro.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Comentarios</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{solicitud.cliente} {solicitud.apellido || ""}</div>
                      <div className="text-xs text-slate-400">{solicitud.email}</div>
                    </td>
                    <td className="px-4 py-4">{solicitud.producto}</td>
                    <td className="px-4 py-4">{solicitud.tipo_servicio}</td>
                    <td className="px-4 py-4 max-w-xs text-slate-300">
                      {solicitud.comentarios || "Sin comentarios adicionales."}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${estados[solicitud.estado] || "bg-slate-700 text-slate-200 border-slate-600"}`}>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      {new Date(solicitud.creado_en).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => cambiarEstado(solicitud.id, "atendida")}
                          className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-white"
                        >
                          Atender
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(solicitud.id, "cancelada")}
                          className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-500 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}