const estados = {
  pendiente: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  atendida: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelada: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const filtros = ['todos', 'pendiente', 'atendida', 'cancelada'];

export default function SolicitudesEmpleado({ solicitudes, cargando, filtro, onCambiarFiltro, onCambiarEstado }) {
  const solicitudesFiltradas = filtro === 'todos'
    ? solicitudes ?? []
    : (solicitudes ?? []).filter((solicitud) => solicitud.estado === filtro);

  return (
    <section className="mt-8 scroll-m-28 rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Solicitudes de clientes</h2>
          <p className="mt-1 text-sm text-slate-400">Revisa las peticiones de cotización y gestión del servicio.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filtros.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => onCambiarFiltro(estado)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                filtro === estado
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-white/10 bg-slate-950 text-slate-300 hover:border-red-500/40'
              }`}
            >
              {estado === 'todos' ? 'Todas' : estado}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="p-8 text-center text-slate-400">Cargando solicitudes...</p>
      ) : solicitudesFiltradas.length === 0 ? (
        <p className="p-8 text-center text-slate-400">No hay solicitudes para este filtro.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Modelo</th>
                <th className="px-6 py-4">Servicio</th>
                <th className="px-6 py-4">Comentarios</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {solicitudesFiltradas.map((solicitud) => (
                <tr key={solicitud.id} className="align-top">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{solicitud.cliente} {solicitud.apellido || ''}</div>
                    <div className="text-xs text-slate-400">{solicitud.email}</div>
                  </td>
                  <td className="px-6 py-4">{solicitud.producto}</td>
                  <td className="px-6 py-4">{solicitud.tipo_servicio}</td>
                  <td className="max-w-xs px-6 py-4 text-slate-300">
                    {solicitud.comentarios || 'Sin comentarios adicionales.'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${estados[solicitud.estado] || 'bg-slate-700 text-slate-200 border-slate-600'}`}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(solicitud.creado_en).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onCambiarEstado(solicitud.id, 'atendida')}
                        className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white"
                      >
                        Atender
                      </button>
                      <button
                        type="button"
                        onClick={() => onCambiarEstado(solicitud.id, 'cancelada')}
                        className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-600 hover:text-white"
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
  );
}
