import { useEffect, useState } from 'react';
import { Filter, MessageSquarePlus, RotateCcw, Send } from 'lucide-react';
import { claseEstado, etiquetaEstado, formatearFecha } from '../../utils/formato';

const claseCampo = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm normal-case text-white outline-none focus:border-red-500';
const TIPOS = ['peticion', 'queja', 'reclamo', 'sugerencia'];
const ESTADOS = ['pendiente', 'en proceso', 'respondida', 'cerrada'];

/** Registro y seguimiento de PQR (cliente) y gestión con respuesta (admin/empleado). */
export default function GestionPqr({
  pqr = [], resumenPqr = {}, filtros, onAplicarFiltros, rol = 'cliente',
  onRegistrar, onCambiarEstado, onResponder,
}) {
  const esCliente = rol === 'cliente';
  const [borrador, setBorrador] = useState(filtros || {});
  const [formulario, setFormulario] = useState({ tipo: 'peticion', asunto: '', descripcion: '' });
  const [respondiendo, setRespondiendo] = useState(null);
  const [respuesta, setRespuesta] = useState({ respuesta: '', estado: 'respondida' });
  const [errorLocal, setErrorLocal] = useState('');

  useEffect(() => { setBorrador(filtros || {}); }, [filtros]);

  const registrar = async (e) => {
    e.preventDefault();
    if (formulario.asunto.trim().length < 5 || formulario.descripcion.trim().length < 10) {
      setErrorLocal('El asunto debe tener al menos 5 caracteres y la descripción al menos 10.');
      return;
    }
    setErrorLocal('');
    const res = await onRegistrar(formulario);
    if (res?.ok) setFormulario({ tipo: 'peticion', asunto: '', descripcion: '' });
  };

  const enviarRespuesta = async (e) => {
    e.preventDefault();
    if (respuesta.respuesta.trim().length < 5) {
      setErrorLocal('La respuesta debe tener al menos 5 caracteres.');
      return;
    }
    setErrorLocal('');
    const res = await onResponder(respondiendo.id, respuesta);
    if (res?.ok) {
      setRespondiendo(null);
      setRespuesta({ respuesta: '', estado: 'respondida' });
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-red-500">Módulo PQR</h1>
        <p className="mt-1 text-slate-400">
          {esCliente
            ? 'Registra peticiones, quejas, reclamos o sugerencias y consulta su estado.'
            : 'Gestiona las PQR de los clientes: cambia el estado y registra la respuesta oficial.'}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ESTADOS.map((estado) => (
          <div key={estado} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <p className="text-sm capitalize text-slate-400">{estado}</p>
            <p className="mt-2 text-3xl font-black text-white">{resumenPqr?.[estado] ?? 0}</p>
          </div>
        ))}
      </div>

      {esCliente && (
        <form onSubmit={registrar} className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <MessageSquarePlus className="h-4 w-4 text-red-400" /> Registrar nueva PQR
          </div>
          {errorLocal && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{errorLocal}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-semibold uppercase text-slate-400">Tipo
              <select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })} className={claseCampo}>
                {TIPOS.map((tipo) => <option key={tipo} value={tipo} className="capitalize">{tipo}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase text-slate-400 sm:col-span-2">Asunto
              <input type="text" maxLength={160} value={formulario.asunto} onChange={(e) => setFormulario({ ...formulario, asunto: e.target.value })} className={claseCampo} />
            </label>
            <label className="block text-xs font-semibold uppercase text-slate-400 sm:col-span-3">Descripción
              <textarea rows="3" maxLength={2000} value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} className={claseCampo} />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700">Enviar PQR</button>
          </div>
        </form>
      )}

      {!esCliente && (
        <form onSubmit={(e) => { e.preventDefault(); onAplicarFiltros(borrador); }} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Filter className="h-4 w-4 text-red-400" /> Filtros de gestión
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-semibold uppercase text-slate-400">Estado
              <select name="estado" value={borrador.estado || ''} onChange={(e) => setBorrador({ ...borrador, estado: e.target.value })} className={claseCampo}>
                <option value="">Todos</option>
                {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase text-slate-400">Tipo
              <select name="tipo" value={borrador.tipo || ''} onChange={(e) => setBorrador({ ...borrador, tipo: e.target.value })} className={claseCampo}>
                <option value="">Todos</option>
                {TIPOS.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase text-slate-400">Buscar
              <input type="text" name="buscar" value={borrador.buscar || ''} onChange={(e) => setBorrador({ ...borrador, buscar: e.target.value })} className={claseCampo} />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setBorrador({}); onAplicarFiltros({}); }} className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">
              <RotateCcw className="h-4 w-4" /> Limpiar
            </button>
            <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">Aplicar filtros</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {pqr.length === 0 && <p className="rounded-xl border border-white/10 bg-slate-900 p-6 text-slate-400">No hay PQR registradas.</p>}
        {pqr.map((registro) => (
          <article key={registro.id} className="rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white">#{registro.id} · {registro.asunto}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {registro.tipo} · {formatearFecha(registro.creadoEn)}
                  {registro.cliente && ` · Cliente: ${registro.cliente}`}
                  {registro.atendidoPor && ` · Atendió: ${registro.atendidoPor}`}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${claseEstado(registro.estado)}`}>{etiquetaEstado(registro.estado)}</span>
            </header>

            <p className="mt-3 text-sm text-slate-300">{registro.descripcion}</p>

            {registro.respuesta && (
              <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-200">
                <p className="text-xs font-semibold uppercase text-emerald-400">Respuesta</p>
                <p className="mt-1">{registro.respuesta}</p>
                {registro.actualizadoEn && <p className="mt-1 text-xs text-emerald-300/70">Actualizada: {formatearFecha(registro.actualizadoEn)}</p>}
              </div>
            )}

            {!esCliente && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select value={registro.estado} onChange={(e) => onCambiarEstado(registro.id, e.target.value)} className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white">
                  {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
                <button type="button" onClick={() => { setRespondiendo(registro); setRespuesta({ respuesta: registro.respuesta || '', estado: 'respondida' }); }} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                  Responder
                </button>
              </div>
            )}

            {respondiendo?.id === registro.id && !esCliente && (
              <form onSubmit={enviarRespuesta} className="mt-4 space-y-3 rounded-lg border border-white/10 bg-slate-950/60 p-4">
                <label className="block text-xs font-semibold uppercase text-slate-400">Respuesta oficial
                  <textarea rows="3" maxLength={2000} value={respuesta.respuesta} onChange={(e) => setRespuesta({ ...respuesta, respuesta: e.target.value })} className={claseCampo} />
                </label>
                <div className="flex items-end gap-3">
                  <label className="block text-xs font-semibold uppercase text-slate-400">Estado
                    <select value={respuesta.estado} onChange={(e) => setRespuesta({ ...respuesta, estado: e.target.value })} className={claseCampo}>
                      {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                    </select>
                  </label>
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
                    <Send className="h-4 w-4" /> Enviar respuesta
                  </button>
                  <button type="button" onClick={() => setRespondiendo(null)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                </div>
              </form>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
