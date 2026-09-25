import Paginacion from '../Paginacion';
import usePaginacion from '../../hooks/usePaginacion';

const POR_PAGINA = 10;

export default function ServiciosAdmin({ servicios, onCrear, onEditar, onEliminar }) {
  const { paginaActual, totalPaginas, totalItems, itemsPaginados, irA } = usePaginacion(servicios || [], POR_PAGINA);

  return (
    <section className="mt-8 scroll-m-28 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Servicios</h2>
          <p className="mt-1 text-sm text-slate-400">Administra los servicios disponibles para los clientes.</p>
        </div>
        <button
          type="button"
          onClick={() => onCrear()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Agregar servicio
        </button>
      </div>

      {!servicios || servicios.length === 0 ? (
        <p className="p-6 text-slate-400">No hay servicios registrados.</p>
      ) : (
        <>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {itemsPaginados.map((servicio) => (
              <tr key={servicio.id}>
                <td className="px-6 py-4 font-semibold text-white">{servicio.nombre}</td>
                <td className="px-6 py-4">{servicio.descripcion || 'Sin descripción'}</td>
                <td className="px-6 py-4 text-red-400">${Number(servicio.precio).toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEditar(servicio)}
                    className="mr-2 rounded border border-blue-500/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-600 hover:text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onEliminar(servicio)}
                    className="rounded border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-600 hover:text-white"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={totalItems}
          porPagina={POR_PAGINA}
          onCambiarPagina={irA}
          etiqueta="servicios"
        />
        </>
      )}
    </section>
  );
}
