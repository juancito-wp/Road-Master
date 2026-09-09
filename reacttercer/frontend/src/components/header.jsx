import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import logoRoadMaster from "../assets/Logo road master.png";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState(null);
  const [rolUsuario, setRolUsuario] = useState(null);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const cuentaRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Escucha cambios de ruta para sincronizar el estado de la sesión
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("nombreUsuario");
    const rolGuardado = localStorage.getItem("rolUsuario");

    if (token && usuarioGuardado) {
      setNombreUsuario(usuarioGuardado);
      setRolUsuario(rolGuardado);
    } else {
      setNombreUsuario(null);
      setRolUsuario(null);
    }
    setCuentaAbierta(false);
  }, [location]);

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (cuentaRef.current && !cuentaRef.current.contains(event.target)) {
        setCuentaAbierta(false);
      }
    };
    document.addEventListener("mousedown", cerrarAlHacerClickFuera);
    return () => document.removeEventListener("mousedown", cerrarAlHacerClickFuera);
  }, []);

  const navLinkStyles = ({ isActive }) =>
    `relative transition-colors duration-300 ${
      isActive ? "text-white font-bold" : "text-gray-400 hover:text-white"
    }`;

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const manejarCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("rolUsuario");
    setNombreUsuario(null);
    setRolUsuario(null);
    cerrarMenu();
    navigate("/login");
  };

  // Asigna el destino según el rol guardado
  const obtenerDatosPanel = () => {
    if (rolUsuario === "admin") {
      return { ruta: "/admin", texto: "Panel Admin" };
    }
    if (rolUsuario === "cliente") {
      return { ruta: "/mi-cuenta", texto: "Mi Cuenta" };
    }
    return { ruta: "/panel-empleado", texto: "Panel de Empleado" };
  };

  const datosPanel = obtenerDatosPanel();
  const esPanelAdmin = location.pathname === "/admin";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 text-white shadow-lg backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* LOGO */}
        <Link to="/" onClick={cerrarMenu} className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-600/20">
            <img
              src={logoRoadMaster}
              alt="Road Master"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div className="leading-none">
            <span className="block text-xl font-black tracking-wider">ROAD</span>
            <span className="block text-xs font-bold tracking-[0.35em] text-red-500">
              MASTER
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN ESCRITORIO */}
        {!esPanelAdmin && <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkStyles}>Inicio</NavLink>
          <NavLink to="/modelos" className={navLinkStyles}>Modelos</NavLink>
          <NavLink to="/nosotros" className={navLinkStyles}>Nosotros</NavLink>
          <NavLink to="/contacto" className={navLinkStyles}>Contacto</NavLink>
        </nav>}

        {/* BOTONES DE USUARIO ESCRITORIO */}
        <div className="hidden items-center gap-4 md:flex">
          {nombreUsuario ? (
            <div ref={cuentaRef} className="relative">
              <button type="button" onClick={() => setCuentaAbierta((abierta) => !abierta)} aria-expanded={cuentaAbierta} aria-haspopup="menu" className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-left transition hover:border-red-500/50 hover:bg-white/5">
                <span className="text-sm font-medium text-slate-300">Bienvenido: <strong className="font-bold text-red-500">{nombreUsuario}</strong></span>
                <ChevronDown className={`h-4 w-4 text-red-400 transition-transform ${cuentaAbierta ? "rotate-180" : ""}`} />
              </button>
              {cuentaAbierta && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 px-3 py-2"><p className="text-xs text-slate-400">Sesión activa</p><p className="truncate text-sm font-bold text-white">{nombreUsuario}</p><p className="mt-1 text-xs capitalize text-red-400">{rolUsuario}</p></div>
                  <Link role="menuitem" to={datosPanel.ruta} onClick={() => setCuentaAbierta(false)} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-red-600 hover:text-white"><LayoutDashboard className="h-4 w-4" />{datosPanel.texto}</Link>
                  <button role="menuitem" type="button" onClick={manejarCerrarSesion} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"><LogOut className="h-4 w-4" />Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md border border-red-500 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/20"
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="rounded-md border border-white/20 p-2 text-gray-300 transition hover:border-red-500 hover:text-white md:hidden"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {menuAbierto && (
        <div className="border-t border-white/10 bg-slate-950 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            {!esPanelAdmin && <><NavLink to="/" onClick={cerrarMenu} className={navLinkStyles}>
              <span className="block border-b border-white/5 py-4">Inicio</span>
            </NavLink>
            <NavLink to="/modelos" onClick={cerrarMenu} className={navLinkStyles}>
              <span className="block border-b border-white/5 py-4">Modelos</span>
            </NavLink>
            <NavLink to="/nosotros" onClick={cerrarMenu} className={navLinkStyles}>
              <span className="block border-b border-white/5 py-4">Nosotros</span>
            </NavLink>
            <NavLink to="/contacto" onClick={cerrarMenu} className={navLinkStyles}>
              <span className="block border-b border-white/5 py-4">Contacto</span>
            </NavLink></>}

            {nombreUsuario ? (
              <div ref={cuentaRef} className="relative mt-4 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setCuentaAbierta((abierta) => !abierta)} aria-expanded={cuentaAbierta} aria-haspopup="menu" className="flex w-full items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-left">
                  <span className="text-sm font-medium text-slate-300">Bienvenido: <strong className="font-bold text-red-500">{nombreUsuario}</strong></span>
                  <ChevronDown className={`h-5 w-5 text-red-400 transition-transform ${cuentaAbierta ? "rotate-180" : ""}`} />
                </button>
                {cuentaAbierta && (
                  <div role="menu" className="mt-2 rounded-xl border border-white/10 bg-slate-900 p-2">
                    <p className="px-3 py-2 text-xs capitalize text-red-400">Rol: {rolUsuario}</p>
                    <Link role="menuitem" to={datosPanel.ruta} onClick={cerrarMenu} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-200 hover:bg-red-600 hover:text-white"><LayoutDashboard className="h-4 w-4" />{datosPanel.texto}</Link>
                    <button role="menuitem" type="button" onClick={manejarCerrarSesion} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white"><LogOut className="h-4 w-4" />Cerrar sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                onClick={cerrarMenu}
                className="mt-4 rounded-md bg-red-600 px-5 py-3 text-center font-bold text-white transition hover:bg-red-700"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}