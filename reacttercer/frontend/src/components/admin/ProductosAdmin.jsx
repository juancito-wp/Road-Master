import { useState } from 'react';
import { Star } from 'lucide-react';
import { IMAGEN_PLACEHOLDER } from '../../constants/imagenPlaceholder';

export default function ProductosAdmin({ modelos, productoMasCaro, onCrear, onEditar, onEliminar }) {
  const [busqueda, setBusqueda] = useState('');

  const modelosFiltrados = modelos?.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.marca && m.marca.toLowerCase().includes(busqueda.toLowerCase()))
  ) ?? [];

  return (
    <div className="mt-6">
      {/* Tarjeta del producto destacado */}
      {productoMasCaro && (
        <div className="mb-6 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={productoMasCaro.imagen || IMAGEN_PLACEHOLDER}
              alt={productoMasCaro.nombre}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGEN_PLACEHOLDER; }}
              className="h-28 w-28 rounded-xl object-cover border border-white/10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Producto Destacado</span>
              </div>
              <h3 className="mt-1 text-2xl font-black text-white">{productoMasCaro.nombre}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {productoMasCaro.marca || 'Sin marca'} — {productoMasCaro.categoria || 'Sin categoría'}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {productoMasCaro.potencia && (
                  <span className="text-slate-300"><span className="font-semibold text-red-400">Potencia:</span> {productoMasCaro.potencia}</span>
                )}
                {productoMasCaro.motor && (
                  <span className="text-slate-300"><span className="font-semibold text-red-400">Motor:</span> {productoMasCaro.motor}</span>
                )}
                {productoMasCaro.transmision && (
                  <span className="text-slate-300"><span className="font-semibold text-red-400">Transmisión:</span> {productoMasCaro.transmision}</span>
                )}
                {productoMasCaro.aplicacion && (
                  <span className="text-slate-300"><span className="font-semibold text-red-400">Aplicación:</span> {productoMasCaro.aplicacion}</span>
                )}
              </div>
            </div>
            <div className="text-right sm:ml-auto">
              <p className="text-xs uppercase text-slate-500">Precio más alto</p>
              <p className="mt-1 text-3xl font-black text-amber-400">
                ${Number(productoMasCaro.precio).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <p className="text-sm text-slate-400">
          {modelos?.length ?? 0} {((modelos?.length ?? 0) === 1 ? 'modelo' : 'modelos')} en total
        </p>
        <button
          type="button"
          onClick={onCrear}
          className="rounded-lg bg-red-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
        >
          + Agregar Nuevo Modelo
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-red-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl" id="productos-admin">
        {!modelos ? (
          <p className="p-8 text-center text-slate-400">Cargando modelos...</p>
        ) : modelosFiltrados.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No se encontraron modelos registrados.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {modelosFiltrados.map((modelo) => {
                const id = modelo._id || modelo.id;
                const esDestacado = productoMasCaro && (productoMasCaro._id || productoMasCaro.id) === id;
                return (
                  <tr
                    key={id}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      esDestacado ? 'bg-amber-500/[0.04] border-l-2 border-l-amber-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={modelo.imagen || IMAGEN_PLACEHOLDER}
                        alt={modelo.nombre}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = IMAGEN_PLACEHOLDER;
                        }}
                        className="h-12 w-12 rounded-md object-cover border border-white/10"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {modelo.nombre}
                      {esDestacado && (
                        <Star className="ml-2 inline h-4 w-4 fill-amber-400 text-amber-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">{modelo.marca || 'N/A'}</td>
                    <td className="px-6 py-4">{modelo.categoria || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-red-400">
                      ${Number(modelo.precio).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEditar(modelo)}
                          className="rounded bg-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onEliminar(id)}
                          className="rounded bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
