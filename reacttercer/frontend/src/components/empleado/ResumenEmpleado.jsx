import { ClipboardList, Clock, Truck, UserCheck, UserX } from 'lucide-react';
import GraficoLineal from '../panel/GraficoLineal';
import TarjetaMetrica from '../panel/TarjetaMetrica';
import TarjetasIndicadores from '../panel/TarjetasIndicadores';

export default function ResumenEmpleado({ solicitudes, modelos, nombre, estadisticas }) {
  const total = (solicitudes ?? []).length;
  const pendientes = (solicitudes ?? []).filter((s) => s.estado === 'pendiente').length;
  const atendidas = (solicitudes ?? []).filter((s) => s.estado === 'atendida').length;
  const canceladas = (solicitudes ?? []).filter((s) => s.estado === 'cancelada').length;

  return (
    <div className="scroll-m-28 space-y-6">
      <header>
        <h1 className="text-3xl font-black text-red-500">Panel de Empleado</h1>
        <p className="mt-1 text-slate-400">
          Bienvenido, {nombre}. Atiende solicitudes, gestiona ventas y PQR, y consulta el estado del negocio.
        </p>
      </header>

      {/* Indicadores entregados por /api/estadisticas/dashboard según el rol */}
      <TarjetasIndicadores cards={estadisticas?.cards} columnas="sm:grid-cols-2 lg:grid-cols-3" />

      <div className="grid gap-6 xl:grid-cols-2">
        <GraficoLineal
          datos={estadisticas?.temporal}
          titulo="Evolución diaria de las ventas"
          descripcion="Comportamiento de las ventas registradas en el sistema."
        />

        <section className="grid gap-4 sm:grid-cols-2">
          <TarjetaMetrica etiqueta="Solicitudes totales" valor={total} color="text-white" icono={ClipboardList} />
          <TarjetaMetrica etiqueta="Pendientes" valor={pendientes} color="text-amber-400" icono={Clock} />
          <TarjetaMetrica etiqueta="Atendidas" valor={atendidas} color="text-emerald-400" icono={UserCheck} />
          <TarjetaMetrica etiqueta="Canceladas" valor={canceladas} color="text-red-400" icono={UserX} />
          <TarjetaMetrica etiqueta="Modelos en catálogo" valor={(modelos ?? []).length} color="text-red-400" icono={Truck} />
        </section>
      </div>
    </div>
  );
}
