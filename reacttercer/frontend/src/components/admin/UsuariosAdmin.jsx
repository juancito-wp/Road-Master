import Paginacion from '../Paginacion';
import usePaginacion from '../../hooks/usePaginacion';

const POR_PAGINA = 10;

export default function UsuariosAdmin({
  usuarios,
  onCambiarEstado,
  onEditar,
  onEliminar,
  onNuevo,
}) {
  const { paginaActual, totalPaginas, totalItems, itemsPaginados, irA } = usePaginacion(usuarios || [], POR_PAGINA);

  return (
    <section className="mt-8 scroll-m-28 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-xl font-bold text-white">Usuarios registrados</h2>
        <p className="mt-1 text-sm text-slate-400">Consulta, activa o desactiva las cuentas de la plataforma.</p>
      </div>

      {!usuarios || usuarios.length === 0 ? (
        <p className="p-6 text-slate-400">No hay usuarios registrados.</p>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <p className="text-sm text-slate-400">
              {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} en total
            </p>
            <button
              type="button"
              onClick={onNuevo}
              className="rounded-lg bg-slate-800 px-5 py-2.5 font-bold text-white transition hover:bg-slate-700"
            >
              + Nuevo Usuario
            </button>
          </div>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {itemsPaginados.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 font-semibold text-white">
                    {usuario.nombre} {usuario.apellido}
                  </td>
                  <td className="px-6 py-4">{usuario.email}</td>
                  <td className="px-6 py-4 capitalize">{usuario.rol}</td>
                  <td className="px-6 py-4 capitalize">{usuario.estado}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onCambiarEstado(usuario)}
                      className="mr-2 rounded border border-blue-500/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-600 hover:text-white"
                    >
                      {usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditar(usuario)}
                      className="mr-2 rounded border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-600 hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminar(usuario)}
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
            etiqueta="usuarios"
          />
        </>
      )}
    </section>
  );
}
