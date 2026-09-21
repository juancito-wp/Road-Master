import { useState } from 'react';
import { IMAGEN_PLACEHOLDER } from '../../constants/imagenPlaceholder';

export default function CatalogoEmpleado({ modelos }) {
  const [busqueda, setBusqueda] = useState('');

  const modelosFiltrados = (modelos ?? []).filter((m) =>
    m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.marca && m.marca.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Catálogo de modelos</h2>
          <p className="mt-1 text-sm text-slate-400">Consulta los vehículos disponibles en la plataforma.</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-red-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        {modelosFiltrados.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No se encontraron modelos registrados.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {modelosFiltrados.map((modelo) => (
                <tr key={modelo._id || modelo.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <img
                      src={modelo.imagen || IMAGEN_PLACEHOLDER}
                      alt={modelo.nombre}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = IMAGEN_PLACEHOLDER;
                      }}
                      className="h-12 w-12 rounded-md border border-white/10 object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{modelo.nombre}</td>
                  <td className="px-6 py-4">{modelo.marca || 'N/A'}</td>
                  <td className="px-6 py-4">{modelo.categoria || 'N/A'}</td>
                  <td className="px-6 py-4 font-semibold text-red-400">
                    ${Number(modelo.precio).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
