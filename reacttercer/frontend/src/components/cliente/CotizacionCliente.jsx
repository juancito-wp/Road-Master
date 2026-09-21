export default function CotizacionCliente({ modelos, cotizacion, cargando, mensaje, modeloPreseleccionado, onChange, onSubmit }) {
  return (
    <section className="mt-8 scroll-m-28 max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
      <h2 className="text-xl font-bold text-red-500">Solicitar cotización / prueba</h2>
      <p className="mt-1 text-sm text-slate-400">Elige un modelo e inicia tu proceso de atención.</p>

      {modeloPreseleccionado && (
        <p className="mt-4 inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
          Vehículo elegido en el catálogo: {modeloPreseleccionado}
        </p>
      )}

      {mensaje && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          {mensaje}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-xs font-semibold uppercase text-slate-400">
          Modelo de interés
          <select
            name="modeloId"
            value={cotizacion.modeloId}
            onChange={onChange}
            disabled={!modelos.length}
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{modelos.length ? '-- Selecciona un vehículo --' : 'No hay modelos disponibles'}</option>
            {modelos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre} - ${Number(m.precio).toLocaleString()}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold uppercase text-slate-400">
          Tipo de solicitud
          <select
            name="tipoServicio"
            value={cotizacion.tipoServicio}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
          >
            <option value="Cotización">Cotización de Compra</option>
            <option value="Prueba de Manejo">Prueba de Manejo (Test Drive)</option>
            <option value="Financiamiento">Información de Financiamiento</option>
          </select>
        </label>

        <label className="block text-xs font-semibold uppercase text-slate-400">
          Comentarios adicionales
          <textarea
            name="comentarios"
            rows="3"
            value={cotizacion.comentarios}
            onChange={onChange}
            placeholder="Indica detalles como horario preferido o dudas..."
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
          />
        </label>

        <div className="flex justify-end border-t border-white/10 pt-4">
          <button
            type="submit"
            disabled={cargando || !modelos.length}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
          >
            {cargando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </section>
  );
}
