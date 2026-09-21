import { useCallback, useEffect, useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { formatearMoneda } from '../../utils/formato';

const claseCampo = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-500';

/** Reporte diario de ventas: consulta en pantalla y exportación a PDF y Excel. */
export default function ReporteDiario({ hoy, onConsultar, onDescargar }) {
  const [fecha, setFecha] = useState(hoy);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  const consultar = useCallback(async (valor) => {
    setCargando(true);
    const res = await onConsultar(valor);
    if (res?.ok) setReporte(res.reporte);
    setCargando(false);
  }, [onConsultar]);

  useEffect(() => { consultar(fecha); }, [fecha, consultar]);

  const resumen = reporte?.resumen;
  const ventas = reporte?.ventas || [];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-red-500">Reporte diario de ventas</h1>
          <p className="mt-1 text-slate-400">Consolida las ventas de una fecha y genera el documento en PDF o Excel.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha del reporte
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={claseCampo} />
          </label>
          <button type="button" onClick={() => onDescargar(fecha, 'pdf')} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700">
            <FileText className="h-4 w-4" /> Exportar PDF
          </button>
          <button type="button" onClick={() => onDescargar(fecha, 'excel')} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700">
            <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
          </button>
        </div>
      </header>

      {cargando && <p className="text-sm text-slate-400">Generando reporte...</p>}

      {resumen && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Ventas del día', resumen.cantidadVentas, 'text-white'],
            ['Total vendido', formatearMoneda(resumen.totalVendido), 'text-green-400'],
            ['Impuestos generados', formatearMoneda(resumen.totalImpuestos), 'text-violet-400'],
            ['Ticket promedio', formatearMoneda(resumen.ticketPromedio), 'text-cyan-400'],
          ].map(([etiqueta, valor, color]) => (
            <div key={etiqueta} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg">
              <p className="text-sm text-slate-400">{etiqueta}</p>
              <p className={`mt-2 text-2xl font-black ${color}`}>{valor}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        {ventas.length === 0 ? (
          <p className="p-6 text-slate-400">No se registraron ventas en la fecha seleccionada.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">N° venta</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Producto / servicio</th>
                <th className="px-5 py-4 text-right">Cantidad</th>
                <th className="px-5 py-4 text-right">Valor unitario</th>
                <th className="px-5 py-4 text-right">Total venta</th>
                <th className="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventas.flatMap((venta) => (venta.detalles || [{}]).map((detalle, indice) => (
                <tr key={`${venta.id}-${detalle.id ?? indice}`}>
                  <td className="px-5 py-3">{(venta.fecha || '').slice(0, 10)}</td>
                  <td className="px-5 py-3 font-bold text-white">#{venta.id}</td>
                  <td className="px-5 py-3">{venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : '—'}</td>
                  <td className="px-5 py-3">{detalle.descripcion || '—'}</td>
                  <td className="px-5 py-3 text-right">{detalle.cantidad ?? '—'}</td>
                  <td className="px-5 py-3 text-right">{formatearMoneda(detalle.precioUnitario)}</td>
                  <td className="px-5 py-3 text-right font-bold text-green-400">{formatearMoneda(venta.total)}</td>
                  <td className="px-5 py-3 capitalize">{venta.estado}</td>
                </tr>
              )))}
            </tbody>
          </table>
        )}
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Download className="h-3.5 w-3.5" /> El PDF y el Excel incluyen el nombre del proyecto, la fecha, el detalle de las ventas y los totales.
      </p>
    </section>
  );
}
