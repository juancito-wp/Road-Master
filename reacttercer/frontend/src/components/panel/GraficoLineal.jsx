import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatearMoneda } from '../../utils/formato';

/** Gráfico lineal reutilizable (tendencia de ventas por día, semana o mes). */
export default function GraficoLineal({ datos, titulo, descripcion }) {
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
            <LineChart data={filas} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="etiqueta" stroke="#94a3b8" fontSize={11} />
              <YAxis yAxisId="izquierda" stroke="#94a3b8" fontSize={11} />
              <YAxis yAxisId="derecha" orientation="right" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0' }}
                formatter={(valor, nombre) => (nombre === 'Total vendido' ? formatearMoneda(valor) : valor)}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line yAxisId="izquierda" type="monotone" dataKey="total" name="Total vendido" stroke="#dc2626" strokeWidth={3} dot={{ r: 3, fill: '#dc2626' }} activeDot={{ r: 6 }} />
              <Line yAxisId="derecha" type="monotone" dataKey="cantidad" name="N° de ventas" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#22d3ee' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
