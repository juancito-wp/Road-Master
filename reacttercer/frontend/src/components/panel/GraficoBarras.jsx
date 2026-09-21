import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatearMoneda } from '../../utils/formato';

/** Gráfico de barras reutilizable para los dashboards. */
export default function GraficoBarras({ datos, titulo, descripcion, clave = 'total', color = '#dc2626' }) {
  const filas = (datos || []).map((fila) => ({
    etiqueta: fila.etiqueta,
    total: Number(fila.total) || 0,
    cantidad: Number(fila.cantidad) || 0,
  }));

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
      <header>
        <h3 className="text-lg font-bold text-white">{titulo}</h3>
        {descripcion && <p className="mt-1 text-sm text-slate-400">{descripcion}</p>}
      </header>

      {filas.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Sin información para los filtros seleccionados.</p>
      ) : (
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filas} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="etiqueta" stroke="#94a3b8" fontSize={11} interval={0} angle={filas.length > 6 ? -18 : 0} height={filas.length > 6 ? 54 : 30} textAnchor={filas.length > 6 ? 'end' : 'middle'} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }}
                formatter={(valor) => formatearMoneda(valor)}
              />
              <Bar dataKey={clave} fill={color} radius={[6, 6, 0, 0]} maxBarSize={64} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
