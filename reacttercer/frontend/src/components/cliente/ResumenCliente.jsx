import { Star, Truck, Wrench } from 'lucide-react';
import TarjetaMetrica from '../panel/TarjetaMetrica';
import TarjetasIndicadores from '../panel/TarjetasIndicadores';

export default function ResumenCliente({ nombre, modelos, servicios, estadisticas }) {
  const productoMasCaro = (modelos ?? []).length > 0
    ? modelos.reduce((max, m) => Number(m.precio) > Number(max.precio) ? m : max)
    : null;

  return (
    <div className="scroll-m-28 space-y-6">
      <header>
        <h1 className="text-3xl font-black text-red-500">Mi Cuenta</h1>
        <p className="mt-1 text-slate-400">
          Hola {nombre || 'cliente'}, consulta tus compras, facturas y PQR, y solicita cotizaciones de vehículos.
        </p>
      </header>

      {/* Indicadores personales entregados por /api/estadisticas/dashboard */}
      <TarjetasIndicadores cards={estadisticas?.cards} columnas="sm:grid-cols-2 lg:grid-cols-3" />

      {/* Resumen del catálogo y producto destacado */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaMetrica etiqueta="Modelos disponibles" valor={(modelos ?? []).length} color="text-red-400" icono={Truck} />
        <TarjetaMetrica etiqueta="Servicios disponibles" valor={(servicios ?? []).length} color="text-blue-400" icono={Wrench} />
        {productoMasCaro && (
          <div className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/30 p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-950/40">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/0 blur-2xl transition-all duration-500 group-hover:bg-amber-500/20" />
            <div className="relative flex items-center justify-between">
              <p className="text-sm text-amber-400/80">Modelo destacado</p>
              <Star className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:scale-125" />
            </div>
            <p className="relative mt-2 text-lg font-bold text-white">{productoMasCaro.nombre}</p>
            <p className="relative mt-1 text-sm text-slate-400">
              {productoMasCaro.marca || 'Sin marca'} — {productoMasCaro.categoria || 'Sin categoría'}
            </p>
            <p className="relative mt-1 text-2xl font-black text-amber-400">
              ${Number(productoMasCaro.precio).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {(estadisticas?.temporal?.length > 0) && (
        <section className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
          <h3 className="text-lg font-bold text-white">Mis compras por mes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {estadisticas.temporal.map((mes) => (
              <li key={mes.clave} className="flex justify-between border-b border-white/5 pb-1">
                <span className="capitalize">{mes.etiqueta}</span>
                <span className="font-bold text-white">${Number(mes.total).toLocaleString()} · {mes.cantidad} venta(s)</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
