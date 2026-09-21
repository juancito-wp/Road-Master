import { useEffect, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { claseEstado, etiquetaEstado, formatearFecha, formatearMoneda } from '../../utils/formato';

const claseCampo = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-500';

/** Historial de ventas con filtros por fecha, cliente, producto, servicio, estado y valor. */
export default function HistorialVentas({
  ventas = [], facturas = [], filtros, onAplicarFiltros, onFacturar, onCambiarEstado, onNuevaVenta,
  puedeGestionar = false, puedeFacturar = false, productos = [], servicios = [], clientes = [], mostrarClientes = false,
}) {
  const [borrador, setBorrador] = useState(filtros || {});
  useEffect(() => { setBorrador(filtros || {}); }, [filtros]);

  const ventasFacturadas = new Set((facturas || []).map((factura) => factura.ventaId));
  const cambiar = (e) => setBorrador((actual) => ({ ...actual, [e.target.name]: e.target.value }));
  const limpiar = () => { setBorrador({}); onAplicarFiltros({}); };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-red-500">Historial de ventas</h1>
          <p className="mt-1 text-slate-400">Consulta las ventas registradas y filtra por fecha, cliente, producto, servicio, estado o valor.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            {ventas.length} venta(s) · <span className="font-bold text-green-400">{formatearMoneda(ventas.reduce((total, venta) => total + Number(venta.total), 0))}</span>
          </p>
          {onNuevaVenta && (
            <button type="button" onClick={onNuevaVenta} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700">
              + Registrar venta
            </button>
          )}
        </div>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); onAplicarFiltros(borrador); }} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <Filter className="h-4 w-4 text-red-400" /> Filtros de búsqueda
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha inicial
            <input type="date" name="fechaInicio" value={borrador.fechaInicio || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha final
            <input type="date" name="fechaFin" value={borrador.fechaFin || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Estado
            <select name="estado" value={borrador.estado || ''} onChange={cambiar} className={claseCampo}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
          {mostrarClientes && (
            <label className="block text-xs font-semibold uppercase text-slate-400">Cliente
              <select name="clienteId" value={borrador.clienteId || ''} onChange={cambiar} className={claseCampo}>
                <option value="">Todos</option>
                {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</option>)}
              </select>
            </label>
          )}
          <label className="block text-xs font-semibold uppercase text-slate-400">Producto
            <select name="productoId" value={borrador.productoId || ''} onChange={cambiar} className={claseCampo}>
              <option value="">Todos</option>
              {productos.map((producto) => <option key={producto.id} value={producto.id}>{producto.nombre}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Servicio
            <select name="servicioId" value={borrador.servicioId || ''} onChange={cambiar} className={claseCampo}>
              <option value="">Todos</option>
              {servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Valor mínimo
            <input type="number" min="0" name="totalMin" value={borrador.totalMin || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Valor máximo
            <input type="number" min="0" name="totalMax" value={borrador.totalMax || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400 sm:col-span-2 lg:col-span-4">Buscar por cliente o ítem
            <input type="text" name="buscar" value={borrador.buscar || ''} onChange={cambiar} placeholder="Nombre del cliente o descripción del producto/servicio" className={claseCampo} />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={limpiar} className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            <RotateCcw className="h-4 w-4" /> Limpiar
          </button>
          <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700">Aplicar filtros</button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        {ventas.length === 0 ? (
          <p className="p-6 text-slate-400">No hay ventas que coincidan con los filtros seleccionados.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-4">N°</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Productos / servicios</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventas.map((venta) => (
                <tr key={venta.id}>
                  <td className="px-5 py-4 font-bold text-white">#{venta.id}</td>
                  <td className="px-5 py-4">{formatearFecha(venta.fecha)}</td>
                  <td className="px-5 py-4">
                    {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : '—'}
                    {venta.vendedor && <span className="block text-xs text-slate-500">Registró: {venta.vendedor}</span>}
                  </td>
                  <td className="px-5 py-4">
                    <ul className="space-y-1">
                      {venta.detalles?.map((detalle) => (
                        <li key={detalle.id} className="text-xs text-slate-400">
                          {detalle.cantidad} × {detalle.descripcion} <span className="uppercase text-slate-500">({detalle.tipo})</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-green-400">{formatearMoneda(venta.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${claseEstado(venta.estado)}`}>{etiquetaEstado(venta.estado)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {puedeFacturar && (
                        <button
                          type="button"
                          onClick={() => onFacturar(venta)}
                          disabled={ventasFacturadas.has(venta.id) || venta.estado === 'anulada'}
                          className="rounded border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-300 transition hover:bg-cyan-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {ventasFacturadas.has(venta.id) ? 'Facturada' : 'Generar factura'}
                        </button>
                      )}
                      {puedeGestionar && venta.estado !== 'pagada' && (
                        <button type="button" onClick={() => onCambiarEstado(venta.id, 'pagada')} className="rounded border border-green-500/30 px-3 py-1.5 text-xs text-green-300 transition hover:bg-green-600 hover:text-white">
                          Marcar pagada
                        </button>
                      )}
                      {puedeGestionar && venta.estado !== 'anulada' && (
                        <button type="button" onClick={() => onCambiarEstado(venta.id, 'anulada')} className="rounded border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-600 hover:text-white">
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
