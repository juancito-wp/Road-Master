import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Genera los números de página a mostrar, con elipsis cuando hay muchas páginas. */
function paginasVisibles(paginaActual, totalPaginas) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }
  const paginas = [1];
  const inicio = Math.max(2, paginaActual - 1);
  const fin = Math.min(totalPaginas - 1, paginaActual + 1);

  if (inicio > 2) paginas.push('...');
  for (let i = inicio; i <= fin; i += 1) paginas.push(i);
  if (fin < totalPaginas - 1) paginas.push('...');
  paginas.push(totalPaginas);

  return paginas;
}

/** Barra de paginación reutilizable para tablas y listados. */
export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalItems,
  porPagina,
  onCambiarPagina,
  etiqueta = 'registros',
}) {
  if (totalItems === 0 || totalPaginas <= 1) return null;

  const desde = (paginaActual - 1) * porPagina + 1;
  const hasta = Math.min(paginaActual * porPagina, totalItems);

  const claseBoton = 'rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40';
  const claseNumero = 'h-8 w-8 rounded-lg text-sm font-semibold transition';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-4 sm:flex-row">
      <p className="text-sm text-slate-400">
        Mostrando <span className="font-semibold text-white">{desde}–{hasta}</span> de{' '}
        <span className="font-semibold text-white">{totalItems}</span> {etiqueta}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`${claseBoton} flex items-center gap-1`}
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>

        {paginasVisibles(paginaActual, totalPaginas).map((pagina, indice) => (
          pagina === '...' ? (
            <span key={`puntos-${indice}`} className="px-2 text-slate-500">…</span>
          ) : (
            <button
              key={pagina}
              type="button"
              onClick={() => onCambiarPagina(pagina)}
              className={`${claseNumero} ${
                pagina === paginaActual
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {pagina}
            </button>
          )
        ))}

        <button
          type="button"
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`${claseBoton} flex items-center gap-1`}
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
