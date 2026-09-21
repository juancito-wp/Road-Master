import { useEffect, useState } from 'react';

/**
 * Tarjeta de métrica animada compartida por todos los paneles.
 */
export default function TarjetaMetrica({ etiqueta, valor, color = 'text-white', icono: Icono }) {
  const [mostrado, setMostrado] = useState(0);

  useEffect(() => {
    let raf;
    const duracion = 900;
    const inicio = performance.now();
    const objetivo = Number(valor) || 0;
    const animar = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      setMostrado(Math.round(progreso * objetivo));
      if (progreso < 1) raf = requestAnimationFrame(animar);
    };
    raf = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(raf);
  }, [valor]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-red-500/50 hover:bg-slate-800 hover:shadow-2xl hover:shadow-red-950/40">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-600/0 blur-2xl transition-all duration-500 group-hover:bg-red-600/20" />

      <div className="relative flex items-center justify-between">
        <p className="text-sm text-slate-400">{etiqueta}</p>
        {Icono && (
          <Icono className="h-5 w-5 text-slate-500 transition-all duration-300 group-hover:scale-125 group-hover:text-red-400" />
        )}
      </div>

      <p className={`relative mt-2 text-4xl font-black transition-transform duration-300 group-hover:origin-left group-hover:scale-110 ${color}`}>
        {mostrado}
      </p>
    </div>
  );
}
