import { useEffect, useState } from 'react';
import { Download, Filter, RotateCcw } from 'lucide-react';
import { claseEstado, etiquetaEstado, formatearFecha, formatearMoneda } from '../../utils/formato';
import Paginacion from '../Paginacion';
import usePaginacion from '../../hooks/usePaginacion';

const claseCampo = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-500';
const POR_PAGINA = 10;

/** Consulta de facturas por número, cliente, fecha o estado, con descarga en PDF. */
export default function GestionFacturas({ facturas = [], filtros, onAplicarFiltros, onDescargar, onCambiarEstado, puedeGestionar = false }) {
  const [borrador, setBorrador] = useState(filtros || {});
  const [detalle, setDetalle] = useState(null);
  useEffect(() => { setBorrador(filtros || {}); }, [filtros]);

  const { paginaActual, totalPaginas, totalItems, itemsPaginados, irA } = usePaginacion(facturas, POR_PAGINA);

  const cambiar = (e) => setBorrador((actual) => ({ ...actual, [e.target.name]: e.target.value }));

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-red-500">Facturación</h1>
        <p className="mt-1 text-slate-400">Consulta las facturas generadas desde las ventas y descárgalas en PDF.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); onAplicarFiltros(borrador); }} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <Filter className="h-4 w-4 text-red-400" /> Criterios de consulta
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-semibold uppercase text-slate-400">Número de factura
            <input type="text" name="numero" value={borrador.numero || ''} onChange={cambiar} placeholder="FAC-20260921-00001" className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Cliente o número
            <input type="text" name="buscar" value={borrador.buscar || ''} onChange={cambiar} placeholder="Nombre del cliente" className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha inicial
            <input type="date" name="fechaInicio" value={borrador.fechaInicio || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha final
            <input type="date" name="fechaFin" value={borrador.fechaFin || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Estado
            <select name="estado" value={borrador.estado || ''} onChange={cambiar} className={claseCampo}>
              <option value="">Todos</option>
              <option value="emitida">Emitida</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => { setBorrador({}); onAplicarFiltros({}); }} className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            <RotateCcw className="h-4 w-4" /> Limpiar
          </button>
          <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700">Buscar facturas</button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        {facturas.length === 0 ? (
          <p className="p-6 text-slate-400">No hay facturas que coincidan con los criterios de búsqueda.</p>
        ) : (
          <>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-4">Número</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4 text-right">Subtotal</th>
                <th className="px-5 py-4 text-right">Impuestos</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {itemsPaginados.map((factura) => (
                <tr key={factura.id}>
                  <td className="px-5 py-4 font-bold text-white">
                    {factura.numero}
                    <button type="button" onClick={() => setDetalle(detalle?.id === factura.id ? null : factura)} className="ml-2 text-xs text-cyan-400 hover:underline">
                      {detalle?.id === factura.id ? 'ocultar detalle' : 'ver detalle'}
                    </button>
                  </td>
                  <td className="px-5 py-4">{formatearFecha(factura.fecha)}</td>
                  <td className="px-5 py-4">{factura.cliente ? `${factura.cliente.nombre} ${factura.cliente.apellido}` : '—'}</td>
                  <td className="px-5 py-4 text-right">{formatearMoneda(factura.subtotal)}</td>
                  <td className="px-5 py-4 text-right">{formatearMoneda(factura.impuesto)}</td>
                  <td className="px-5 py-4 text-right font-bold text-green-400">{formatearMoneda(factura.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${claseEstado(factura.estado)}`}>{etiquetaEstado(factura.estado)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => onDescargar(factura)} className="flex items-center gap-1 rounded border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-300 transition hover:bg-cyan-600 hover:text-white">
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                      {puedeGestionar && factura.estado !== 'pagada' && (
                        <button type="button" onClick={() => onCambiarEstado(factura.id, 'pagada')} className="rounded border border-green-500/30 px-3 py-1.5 text-xs text-green-300 transition hover:bg-green-600 hover:text-white">
                          Marcar pagada
                        </button>
                      )}
                      {puedeGestionar && factura.estado !== 'anulada' && (
                        <button type="button" onClick={() => onCambiarEstado(factura.id, 'anulada')} className="rounded border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-600 hover:text-white">
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {detalle && (
                <tr className="bg-slate-950/60">
                  <td colSpan={8} className="px-5 py-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">Detalle de la factura {detalle.numero}</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
                      {detalle.detalles?.map((item) => (
                        <li key={item.id} className="flex justify-between border-b border-white/5 py-1">
                          <span>{item.cantidad} × {item.descripcion} ({formatearMoneda(item.precioUnitario)})</span>
                          <span className="font-semibold text-white">{formatearMoneda(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalItems={totalItems}
            porPagina={POR_PAGINA}
            onCambiarPagina={irA}
            etiqueta="facturas"
          />
          </>
        )}
      </div>
    </section>
  );
}
