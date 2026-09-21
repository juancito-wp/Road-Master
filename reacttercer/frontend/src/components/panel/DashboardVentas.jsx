import { useEffect, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import GraficoBarras from './GraficoBarras';
import GraficoLineal from './GraficoLineal';
import TarjetasIndicadores from './TarjetasIndicadores';
import { formatearMoneda } from '../../utils/formato';

const claseCampo = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-500';

/** Dashboard de ventas: indicadores, gráfico de barras, gráfico lineal y filtros dinámicos. */
export default function DashboardVentas({
  estadisticas, filtros, onAplicarFiltros, productos = [], servicios = [], clientes = [], mostrarClientes = false,
  titulo = 'Dashboard de ventas', descripcion = 'Información calculada en FastAPI a partir de las ventas registradas.',
}) {
  const [borrador, setBorrador] = useState(filtros || {});

  useEffect(() => { setBorrador(filtros || {}); }, [filtros]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setBorrador((actual) => ({ ...actual, [name]: value }));
  };

  const aplicar = (e) => {
    e.preventDefault();
    onAplicarFiltros(borrador);
  };

  const limpiar = () => {
    const vacio = { agrupacion: 'dia' };
    setBorrador(vacio);
    onAplicarFiltros(vacio);
  };

  const datos = estadisticas || { cards: [], temporal: [], productos: [] };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-red-500">{titulo}</h1>
        <p className="mt-1 text-slate-400">{descripcion}</p>
      </header>

      <form onSubmit={aplicar} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <Filter className="h-4 w-4 text-red-400" /> Filtros del dashboard
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha inicial
            <input type="date" name="fechaInicio" value={borrador.fechaInicio || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Fecha final
            <input type="date" name="fechaFin" value={borrador.fechaFin || ''} onChange={cambiar} className={claseCampo} />
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Agrupación
            <select name="agrupacion" value={borrador.agrupacion || 'dia'} onChange={cambiar} className={claseCampo}>
              <option value="dia">Por día</option>
              <option value="semana">Por semana</option>
              <option value="mes">Por mes</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase text-slate-400">Estado de la venta
            <select name="estado" value={borrador.estado || ''} onChange={cambiar} className={claseCampo}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
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
          {mostrarClientes && (
            <label className="block text-xs font-semibold uppercase text-slate-400">Cliente
              <select name="clienteId" value={borrador.clienteId || ''} onChange={cambiar} className={claseCampo}>
                <option value="">Todos</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={limpiar} className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            <RotateCcw className="h-4 w-4" /> Limpiar
          </button>
          <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700">
            Aplicar filtros
          </button>
        </div>
      </form>

      <TarjetasIndicadores cards={datos.cards} columnas="sm:grid-cols-2 lg:grid-cols-5" />

      <div className="grid gap-6 xl:grid-cols-2">
        <GraficoLineal
          datos={datos.temporal}
          titulo="Tendencia de ventas"
          descripcion={`Evolución ${datos.filtros?.agrupacion === 'mes' ? 'mensual' : datos.filtros?.agrupacion === 'semana' ? 'semanal' : 'diaria'} del valor vendido y del número de ventas.`}
        />
        <GraficoBarras
          datos={datos.productos}
          titulo="Productos y servicios más vendidos"
          descripcion="Valor total vendido por producto o servicio registrado en el detalle de las ventas."
        />
      </div>

      {datos.productos?.length > 0 && (
        <section className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
          <div className="border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Ranking de productos y servicios</h3>
          </div>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3">Producto / Servicio</th>
                <th className="px-6 py-3 text-right">Cantidad</th>
                <th className="px-6 py-3 text-right">Valor vendido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {datos.productos.map((item) => (
                <tr key={item.etiqueta}>
                  <td className="px-6 py-3 font-semibold text-white">{item.etiqueta}</td>
                  <td className="px-6 py-3 text-right">{Number(item.cantidad).toLocaleString('es-CO')}</td>
                  <td className="px-6 py-3 text-right text-green-400">{formatearMoneda(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
