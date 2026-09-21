export default function PerfilCliente({ usuario, cargando, mensaje, onChange, onSubmit }) {
  return (
    <section className="mt-8 scroll-m-28 max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-red-500">Datos personales</h2>
      <p className="mt-1 text-sm text-slate-400">Actualiza la información de tu cuenta.</p>

      {mensaje && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          {mensaje}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold uppercase text-slate-400">
          Nombre
          <input
            type="text"
            name="nombre"
            value={usuario.nombre}
            onChange={onChange}
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
            required
          />
        </label>

        <label className="block text-xs font-semibold uppercase text-slate-400">
          Apellido
          <input
            type="text"
            name="apellido"
            value={usuario.apellido}
            onChange={onChange}
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
            required
          />
        </label>

        <label className="block text-xs font-semibold uppercase text-slate-400">
          Correo electrónico
          <input
            type="email"
            name="email"
            value={usuario.email}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
            required
          />
        </label>

        <label className="block text-xs font-semibold uppercase text-slate-400">
          Teléfono
          <input
            type="text"
            name="telefono"
            value={usuario.telefono}
            onChange={onChange}
            inputMode="numeric"
            maxLength={10}
            placeholder="3000000000"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
          />
        </label>

        <label className="block text-xs font-semibold uppercase text-slate-400 sm:col-span-2">
          Dirección
          <input
            type="text"
            name="direccion"
            value={usuario.direccion}
            onChange={onChange}
            maxLength={180}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
            required
          />
        </label>

        <div className="col-span-full flex justify-end border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={cargando}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}
