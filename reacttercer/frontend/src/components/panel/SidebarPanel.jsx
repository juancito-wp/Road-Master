import { useState } from 'react';
import { GitBranch, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Sidebar reutilizable para todos los paneles (admin, empleado, cliente).
 * Mantiene exactamente la misma estructura y estilo del panel de administración.
 */
export default function SidebarPanel({ titulo, items, seccionActiva, onCambiarSeccion }) {
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();
  const nombreUsuario = localStorage.getItem('nombreUsuario');
  const rolUsuario = localStorage.getItem('rolUsuario');

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('rolUsuario');
    navigate('/login');
  };

  return (
    <>
      {/* En movil la barra lateral se oculta y se abre con el boton flotante */}
      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={`fixed bottom-6 left-6 z-40 items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 lg:hidden ${
          abierto ? 'hidden' : 'flex'
        }`}
        aria-label="Abrir menú del panel"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        Menú
      </button>

      <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
        abierto ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Header */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <GitBranch className="h-7 w-7 text-red-500" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Road Master</p>
          <p className="mt-0.5 text-sm font-black text-white">{titulo}</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label={`Navegación de ${titulo}`}>
        {items.map(({ id, label, icon: Icono }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onCambiarSeccion(id);
              setAbierto(false);
            }}
            className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-400 transition-all ${
              seccionActiva === id ? 'bg-red-600/10 text-white' : 'hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {seccionActiva === id && (
              <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-red-500 shadow-lg shadow-red-600/40" />
            )}

            <Icono
              className={`h-5 w-5 transition-transform ${
                seccionActiva === id ? 'scale-110 text-red-400' : 'group-hover:text-red-400'
              }`}
            />
            {label}
          </button>
        ))}

        <div className="my-3 border-t border-white/10" />

        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5.25 9.75V19.5A1.5 1.5 0 0 0 6.75 21h10.5a1.5 1.5 0 0 0 1.5-1.5V9.75" />
          </svg>
          Ver página web
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        {nombreUsuario && (
          <div className="mb-3 px-1">
            <p className="text-xs text-slate-500">Sesión activa</p>
            <p className="truncate text-sm font-bold text-white">{nombreUsuario}</p>
            {rolUsuario && <p className="text-xs capitalize text-red-400">{rolUsuario}</p>}
          </div>
        )}
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
        <p className="mt-3 px-1 text-xs text-slate-500">© 2026 Road Master</p>
      </div>
      </aside>
    </>
  );
}
