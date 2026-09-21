import { Users, UserCheck, UserX, ClipboardList, Clock, Star } from 'lucide-react';
import GraficoLineal from '../panel/GraficoLineal';
import TarjetaMetrica from '../panel/TarjetaMetrica';
import TarjetasIndicadores from '../panel/TarjetasIndicadores';

export default function ResumenAdmin({ usuarios, modelos, servicios, solicitudes, estadisticas }) {
  const usuariosActivos = (usuarios ?? []).filter((u) => u.estado === 'activo').length;
  const usuariosInactivos = (usuarios ?? []).length - usuariosActivos;
  const clientes = (usuarios ?? []).filter((u) => u.rol === 'cliente').length;
  const empleados = (usuarios ?? []).filter((u) => u.rol === 'empleado').length;
  const solicitudesPendientes = (solicitudes ?? []).filter((s) => s.estado === 'pendiente').length;
  const solicitudesAtendidas = (solicitudes ?? []).filter((s) => s.estado === 'atendida').length;

  const productoMasCaro = (modelos ?? []).length > 0
    ? modelos.reduce((max, m) => Number(m.precio) > Number(max.precio) ? m : max)
    : null;

  const estadosVentas = estadisticas?.estados?.ventas || {};
  const estadosPqr = estadisticas?.estados?.pqr || {};

  return (
    <div className="scroll-m-28 space-y-6">
      <header>
        <h1 className="text-3xl font-black text-red-500">Panel de Administración</h1>
        <p className="mt-1 text-slate-400">
          Indicadores consolidados del sistema (calculados en FastAPI a partir de la base de datos SQL).
        </p>
      </header>

      {/* Indicadores del sistema entregados por /api/estadisticas/dashboard */}
      <TarjetasIndicadores cards={estadisticas?.cards} columnas="sm:grid-cols-2 lg:grid-cols-4" />

      <div className="grid gap-6 xl:grid-cols-2">
        <GraficoLineal
          datos={estadisticas?.temporal}
          titulo="Evolución diaria de las ventas"
          descripcion="Valor vendido y número de ventas registradas por día."
        />

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TarjetaMetrica etiqueta="Solicitudes pendientes" valor={solicitudesPendientes} color="text-yellow-400" icono={Clock} />
            <TarjetaMetrica etiqueta="Solicitudes atendidas" valor={solicitudesAtendidas} color="text-emerald-400" icono={ClipboardList} />
            <TarjetaMetrica etiqueta="Clientes" valor={clientes} color="text-cyan-400" icono={Users} />
            <TarjetaMetrica etiqueta="Empleados" valor={empleados} color="text-violet-400" icono={UserCheck} />
            <TarjetaMetrica etiqueta="Usuarios inactivos" valor={usuariosInactivos} color="text-slate-500" icono={UserX} />
            <TarjetaMetrica etiqueta="Servicios registrados" valor={(servicios ?? []).length} color="text-blue-400" icono={ClipboardList} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg">
              <p className="text-sm text-slate-400">Ventas por estado</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {Object.keys(estadosVentas).length === 0 && <li className="text-slate-500">Sin ventas registradas.</li>}
                {Object.entries(estadosVentas).map(([estado, cantidad]) => (
                  <li key={estado} className="flex justify-between border-b border-white/5 pb-1 capitalize">
                    <span>{estado}</span><span className="font-bold text-white">{cantidad}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg">
              <p className="text-sm text-slate-400">PQR por estado</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {Object.entries(estadosPqr).map(([estado, cantidad]) => (
                  <li key={estado} className="flex justify-between border-b border-white/5 pb-1 capitalize">
                    <span>{estado}</span><span className="font-bold text-white">{cantidad}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {productoMasCaro && (
            <div className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/30 p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-950/40">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/0 blur-2xl transition-all duration-500 group-hover:bg-amber-500/20" />
              <div className="relative flex items-center justify-between">
                <p className="text-sm text-amber-400/80">Producto destacado</p>
                <Star className="h-5 w-5 text-amber-500 transition-all duration-300 group-hover:scale-125" />
              </div>
              <p className="relative mt-2 text-lg font-bold text-white">{productoMasCaro.nombre}</p>
              <p className="relative mt-1 text-sm text-slate-400">{productoMasCaro.marca || 'Sin marca'} — {productoMasCaro.potencia || ''}</p>
              <p className="relative mt-1 text-2xl font-black text-amber-400">
                ${Number(productoMasCaro.precio).toLocaleString()}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
