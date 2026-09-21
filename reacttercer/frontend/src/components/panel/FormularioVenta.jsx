import { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { formatearMoneda } from '../../utils/formato';

const claseCampo = 'mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm normal-case text-white outline-none focus:border-red-500';

/**
 * Registro de una venta con detalle de productos y/o servicios.
 * `clienteFijo` se usa cuando el usuario autenticado es un cliente (la venta queda a su nombre).
 */
export default function FormularioVenta({ productos = [], servicios = [], clientes = [], clienteFijo = false, onRegistrar, onCerrar }) {
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState([]);
  const [borrador, setBorrador] = useState({ tipo: 'producto', id: '', cantidad: '1', descuento: '0' });
  const [descuento, setDescuento] = useState('0');
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState('19');
  const [observaciones, setObservaciones] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const [guardando, setGuardando] = useState(false);

  const catalogo = borrador.tipo === 'producto' ? productos : servicios;

  const detalle = useMemo(() => items.map((item) => {
    const fuente = item.tipo === 'producto'
      ? productos.find((producto) => String(producto.id) === String(item.id))
      : servicios.find((servicio) => String(servicio.id) === String(item.id));
    const precio = Number(fuente?.precio || 0);
    return {
      ...item,
      nombre: fuente?.nombre || `Ítem #${item.id}`,
      precio,
      subtotal: Math.max(Number(item.cantidad) * precio - Number(item.descuento), 0),
    };
  }), [items, productos, servicios]);

  const subtotal = detalle.reduce((total, item) => total + item.subtotal, 0);
  const base = Math.max(subtotal - Number(descuento || 0), 0);
  const impuesto = base * Number(impuestoPorcentaje || 0) / 100;
  const total = base + impuesto;

  const agregarItem = () => {
    if (!borrador.id) {
      setErrorLocal('Selecciona un producto o servicio para agregar.');
      return;
    }
    if (Number(borrador.cantidad) <= 0) {
      setErrorLocal('La cantidad debe ser mayor que cero.');
      return;
    }
    setItems((actuales) => [...actuales, {
      tipo: borrador.tipo,
      id: borrador.id,
      cantidad: Number(borrador.cantidad),
      descuento: Number(borrador.descuento || 0),
    }]);
    setBorrador((actual) => ({ ...actual, id: '', cantidad: '1', descuento: '0' }));
    setErrorLocal('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!clienteFijo && !clienteId) {
      setErrorLocal('Selecciona el cliente de la venta.');
      return;
    }
    if (items.length === 0) {
      setErrorLocal('Agrega al menos un producto o servicio a la venta.');
      return;
    }
    setGuardando(true);
    const resultado = await onRegistrar({
      clienteId: clienteFijo ? undefined : Number(clienteId),
      items: items.map((item) => ({
        productoId: item.tipo === 'producto' ? Number(item.id) : undefined,
        servicioId: item.tipo === 'servicio' ? Number(item.id) : undefined,
        cantidad: item.cantidad,
        descuento: item.descuento,
      })),
      descuento: Number(descuento || 0),
      impuestoPorcentaje: Number(impuestoPorcentaje || 0),
      observaciones: observaciones || undefined,
    });
    setGuardando(false);
    if (resultado?.ok) onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Registrar venta</h2>
            <p className="mt-1 text-xs text-slate-400">El detalle se guarda en las tablas ventas y detalle_ventas de la base de datos SQL.</p>
          </div>
          <button type="button" onClick={onCerrar} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorLocal && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-300">{errorLocal}</div>
        )}

        <form onSubmit={enviar} className="mt-6 space-y-5">
          {!clienteFijo && (
            <label className="block text-xs font-semibold uppercase text-slate-400">Cliente
              <select name="clienteId" value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={claseCampo}>
                <option value="">Selecciona un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido} — {cliente.email}</option>
                ))}
              </select>
            </label>
          )}

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Agregar productos o servicios</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <label className="block text-xs font-semibold uppercase text-slate-500">Tipo
                <select value={borrador.tipo} onChange={(e) => setBorrador({ ...borrador, tipo: e.target.value, id: '' })} className={claseCampo}>
                  <option value="producto">Producto</option>
                  <option value="servicio">Servicio</option>
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-500 sm:col-span-2">Ítem
                <select value={borrador.id} onChange={(e) => setBorrador({ ...borrador, id: e.target.value })} className={claseCampo}>
                  <option value="">Selecciona {borrador.tipo === 'producto' ? 'un producto' : 'un servicio'}</option>
                  {catalogo.map((item) => (
                    <option key={item.id} value={item.id}>{item.nombre} — {formatearMoneda(item.precio)}</option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-500">Cantidad
                <input type="number" min="1" value={borrador.cantidad} onChange={(e) => setBorrador({ ...borrador, cantidad: e.target.value })} className={claseCampo} />
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-500">Descuento
                <input type="number" min="0" value={borrador.descuento} onChange={(e) => setBorrador({ ...borrador, descuento: e.target.value })} className={claseCampo} />
              </label>
              <div className="flex items-end sm:col-span-3">
                <button type="button" onClick={agregarItem} className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700">
                  <Plus className="h-4 w-4" /> Agregar ítem
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Precio unit.</th>
                  <th className="px-4 py-3 text-right">Descuento</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {detalle.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-4 text-slate-500">Aún no has agregado productos ni servicios.</td></tr>
                )}
                {detalle.map((item, indice) => (
                  <tr key={`${item.tipo}-${item.id}-${indice}`}>
                    <td className="px-4 py-3 font-semibold text-white">
                      {item.nombre}
                      <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase text-slate-400">{item.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{item.cantidad}</td>
                    <td className="px-4 py-3 text-right">{formatearMoneda(item.precio)}</td>
                    <td className="px-4 py-3 text-right">{formatearMoneda(item.descuento)}</td>
                    <td className="px-4 py-3 text-right text-green-400">{formatearMoneda(item.subtotal)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setItems((actuales) => actuales.filter((_, i) => i !== indice))} className="rounded border border-red-500/30 p-1.5 text-red-300 hover:bg-red-600 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-semibold uppercase text-slate-400">Descuento global
              <input type="number" min="0" value={descuento} onChange={(e) => setDescuento(e.target.value)} className={claseCampo} />
            </label>
            <label className="block text-xs font-semibold uppercase text-slate-400">Impuesto (%)
              <input type="number" min="0" max="100" step="0.01" value={impuestoPorcentaje} onChange={(e) => setImpuestoPorcentaje(e.target.value)} className={claseCampo} />
            </label>
            <label className="block text-xs font-semibold uppercase text-slate-400">Observaciones
              <input type="text" maxLength={500} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className={claseCampo} />
            </label>
          </div>

          <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm sm:grid-cols-4">
            <p className="text-slate-400">Subtotal: <span className="font-bold text-white">{formatearMoneda(subtotal)}</span></p>
            <p className="text-slate-400">Descuento: <span className="font-bold text-white">{formatearMoneda(descuento)}</span></p>
            <p className="text-slate-400">Impuesto: <span className="font-bold text-white">{formatearMoneda(impuesto)}</span></p>
            <p className="text-slate-400">Total: <span className="text-lg font-black text-green-400">{formatearMoneda(total)}</span></p>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button type="button" onClick={onCerrar} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
            <button type="submit" disabled={guardando} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
              {guardando ? 'Guardando...' : 'Registrar venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
