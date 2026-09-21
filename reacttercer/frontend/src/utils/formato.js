/** Utilidades compartidas por los módulos comerciales del quinto avance. */

export const formatearMoneda = (valor) =>
  `$${Number(valor || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

export const formatearFecha = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const hoyISO = () => new Date().toISOString().slice(0, 10);

export const inicioMesISO = () => {
  const fecha = new Date();
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().slice(0, 10);
};

/** Guarda una respuesta blob (PDF/Excel) del backend como archivo descargable. */
export const descargarArchivo = (respuesta, nombre) => {
  const url = URL.createObjectURL(new Blob([respuesta.data]));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
};

export const ETIQUETAS_ESTADO = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  anulada: 'Anulada',
  emitida: 'Emitida',
  'en proceso': 'En proceso',
  respondida: 'Respondida',
  cerrada: 'Cerrada',
  atendida: 'Atendida',
  cancelada: 'Cancelada',
};

export const CLASES_ESTADO = {
  pendiente: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'en proceso': 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  pagada: 'bg-green-500/10 text-green-300 border-green-500/30',
  emitida: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  respondida: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  cerrada: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  anulada: 'bg-red-500/10 text-red-300 border-red-500/30',
};

export const claseEstado = (estado) => CLASES_ESTADO[estado] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';

export const etiquetaEstado = (estado) => ETIQUETAS_ESTADO[estado] || estado;
