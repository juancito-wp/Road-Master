import { useEffect, useState } from 'react';

/**
 * Pagina una lista en memoria.
 * @param {Array} items Lista completa a paginar.
 * @param {number} porPagina Cantidad de elementos por página.
 * @returns {{ paginaActual:number, totalPaginas:number, totalItems:number, itemsPaginados:Array, irA:(p:number)=>void }}
 */
export default function usePaginacion(items = [], porPagina = 10) {
  const [paginaActual, setPaginaActual] = useState(1);
  const totalItems = items.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina));

  // Vuelve a la primera página cuando cambia el conjunto de datos (búsquedas, filtros o recargas).
  useEffect(() => {
    setPaginaActual(1);
  }, [totalItems]);

  // Si la página actual queda fuera de rango, la ajusta a la última válida.
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [paginaActual, totalPaginas]);

  const inicio = (paginaActual - 1) * porPagina;
  const itemsPaginados = items.slice(inicio, inicio + porPagina);

  return {
    paginaActual,
    totalPaginas,
    totalItems,
    itemsPaginados,
    irA: setPaginaActual,
  };
}
