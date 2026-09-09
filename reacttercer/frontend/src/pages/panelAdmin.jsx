import { useState, useEffect } from "react";
import { Users, UserCheck, Truck } from "lucide-react";
import API from "../api/axios";

// ==========================================
// TARJETA DE MÉTRICA CON ANIMACIÓN
// ==========================================
function TarjetaMetrica({ etiqueta, valor, color, icono: Icono }) {
  const [mostrado, setMostrado] = useState(0);

  // Contador animado: sube de 0 al valor cada vez que cambia
  useEffect(() => {
    let raf;
    const duracion = 900;
    const inicio = performance.now();
    const animar = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      setMostrado(Math.round(progreso * valor));
      if (progreso < 1) raf = requestAnimationFrame(animar);
    };
    raf = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(raf);
  }, [valor]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-red-500/50 hover:bg-slate-800 hover:shadow-2xl hover:shadow-red-950/40">
      {/* Resplandor decorativo que aparece al pasar el cursor */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-600/0 blur-2xl transition-all duration-500 group-hover:bg-red-600/20" />

      <div className="relative flex items-center justify-between">
        <p className="text-sm text-slate-400">{etiqueta}</p>
        <Icono className="h-5 w-5 text-slate-500 transition-all duration-300 group-hover:scale-125 group-hover:text-red-400" />
      </div>

      <p className={`relative mt-2 text-4xl font-black transition-transform duration-300 group-hover:origin-left group-hover:scale-110 ${color}`}>
        {mostrado}
      </p>
    </div>
  );
}

export default function PanelAdmin() {
  const [modelos, setModelos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formularioUsuario, setFormularioUsuario] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    email: "",
    rol: "cliente",
  });
  const [servicios, setServicios] = useState([]);
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formularioServicio, setFormularioServicio] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
  });
  const [mostrarModalNuevoUsuario, setMostrarModalNuevoUsuario] = useState(false);
  const [formularioNuevoUsuario, setFormularioNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    email: "",
    rol: "cliente",
    password: "",
    confirmarPassword: "",
  });
  const [erroresNuevoUsuario, setErroresNuevoUsuario] = useState({});

  // Estado para el modal de confirmación de eliminación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(null);
  const [tituloConfirmacion, setTituloConfirmacion] = useState("");
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  // Estado para el modal de Crear/Editar
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre: "",
    marca: "",
    precio: "",
    categoria: "",
    imagen: "",
    descripcion: "",
    potencia: "",
    motor: "",
    transmision: "",
    aplicacion: "",
  });
  const [archivoImagen, setArchivoImagen] = useState(null);

  // ==========================================
  // 1. OBTENER PRODUCTOS/MODELOS (READ)
  // ==========================================
  const obtenerModelos = async () => {
    try {
      setCargando(true);
      const res = await API.get("/productos"); // Ajusta el endpoint según tu backend (/modelos o /productos)
      setModelos(res.data);
      setError("");
    } catch {
      setError("Error al cargar la lista de modelos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await API.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar los usuarios.");
    }
  };

  const obtenerServicios = async () => {
    try {
      const res = await API.get("/servicios");
      setServicios(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar los servicios.");
    }
  };

  useEffect(() => {
    obtenerModelos();
    obtenerUsuarios();
    obtenerServicios();
  }, []);

  const cambiarEstadoUsuario = async (usuario) => {
    const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo";
    try {
      await API.patch(`/usuarios/${usuario.id}/estado`, { estado: nuevoEstado });
      setUsuarios((actuales) => actuales.map((actual) => (
        actual.id === usuario.id ? { ...actual, estado: nuevoEstado } : actual
      )));
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar el estado.");
    }
  };

  const eliminarUsuario = async (usuario) => {
    setTituloConfirmacion("Eliminar usuario");
    setMensajeConfirmacion(`¿Estás seguro de que deseas eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`);
    setConfirmacionPendiente(() => async () => {
      try {
        await API.delete(`/usuarios/${usuario.id}`);
        setUsuarios((actuales) => actuales.filter((actual) => actual.id !== usuario.id));
        setMensajeExito("Usuario eliminado correctamente.");
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el usuario.");
      }
    });
    setMostrarConfirmacion(true);
  };

  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setFormularioUsuario({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      tipoDocumento: usuario.tipoDocumento || "CC",
      numeroDocumento: usuario.numeroDocumento || "",
      direccion: usuario.direccion || "",
      telefono: usuario.telefono || "",
      email: usuario.email || "",
      rol: usuario.rol || "cliente",
    });
    setError("");
    setMostrarModalUsuario(true);
  };

  const manejarCambioUsuario = (e) => {
    const { name, value } = e.target;
    setFormularioUsuario((actual) => ({ ...actual, [name]: value }));
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    setError("");
    const { nombre, apellido, numeroDocumento, direccion, telefono, email } = formularioUsuario;
    if (!nombre.trim() || !apellido.trim() || !direccion.trim() || !/^\d{6,12}$/.test(numeroDocumento) || !/^\d{7,10}$/.test(telefono) || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Revisa los datos del usuario: campos obligatorios, documento, teléfono y correo válido.");
      return;
    }
    try {
      await API.put(`/usuarios/${usuarioEditando.id}`, formularioUsuario);
      setUsuarios((actuales) => actuales.map((usuario) => (
        usuario.id === usuarioEditando.id ? { ...usuario, ...formularioUsuario } : usuario
      )));
      setMostrarModalUsuario(false);
      setMensajeExito("Usuario actualizado correctamente.");
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario.");
    }
  };

  const abrirModalServicio = (servicio = null) => {
    setServicioEditando(servicio);
    setFormularioServicio({
      nombre: servicio?.nombre || "",
      descripcion: servicio?.descripcion || "",
      precio: servicio?.precio || "",
    });
    setError("");
    setMostrarModalServicio(true);
  };

  const manejarCambioServicio = (e) => {
    const { name, value } = e.target;
    setFormularioServicio((actual) => ({ ...actual, [name]: value }));
  };

  const guardarServicio = async (e) => {
    e.preventDefault();
    setError("");
    if (!formularioServicio.nombre.trim() || Number(formularioServicio.precio) < 0) {
      setError("El nombre y un precio válido son obligatorios.");
      return;
    }
    try {
      const datos = { ...formularioServicio, precio: Number(formularioServicio.precio) };
      if (servicioEditando) {
        await API.put(`/servicios/${servicioEditando.id}`, datos);
        setMensajeExito("Servicio actualizado correctamente.");
      } else {
        await API.post("/servicios", datos);
        setMensajeExito("Servicio creado correctamente.");
      }
      setMostrarModalServicio(false);
      obtenerServicios();
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar el servicio.");
    }
  };

  const eliminarServicio = async (servicio) => {
    setTituloConfirmacion("Eliminar servicio");
    setMensajeConfirmacion(`¿Estás seguro de que deseas eliminar el servicio ${servicio.nombre}? Esta acción no se puede deshacer.`);
    setConfirmacionPendiente(() => async () => {
      try {
        await API.delete(`/servicios/${servicio.id}`);
        setServicios((actuales) => actuales.filter((actual) => actual.id !== servicio.id));
        setMensajeExito("Servicio eliminado correctamente.");
        setTimeout(() => setMensajeExito(""), 3000);
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el servicio.");
      }
    });
    setMostrarConfirmacion(true);
  };

  // ==========================================
  // CREAR USUARIO (CREATE) — SOLO ADMIN
  // ==========================================

  const abrirModalNuevoUsuario = () => {
    setFormularioNuevoUsuario({
      nombre: "", apellido: "", tipoDocumento: "CC", numeroDocumento: "",
      direccion: "", telefono: "", email: "", rol: "cliente", password: "", confirmarPassword: "",
    });
    setErroresNuevoUsuario({});
    setError("");
    setMostrarModalNuevoUsuario(true);
  };

  const manejarCambioNuevoUsuario = (e) => {
    const { name, value } = e.target;
    const valorNormalizado = ["numeroDocumento", "telefono"].includes(name) ? value.replace(/\D/g, "") : value;
    setFormularioNuevoUsuario((actual) => ({ ...actual, [name]: valorNormalizado }));
    setErroresNuevoUsuario((actual) => ({ ...actual, [name]: "" }));
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    setError("");
    const errores = {};
    const { nombre, apellido, tipoDocumento, numeroDocumento, direccion, telefono, email, rol, password, confirmarPassword } = formularioNuevoUsuario;

    if (!nombre.trim() || nombre.trim().length < 3) errores.nombre = "El nombre es obligatorio (mínimo 3 caracteres).";
    if (!apellido.trim() || apellido.trim().length < 3) errores.apellido = "El apellido es obligatorio (mínimo 3 caracteres).";
    if (!tipoDocumento) errores.tipoDocumento = "Selecciona un tipo de documento.";
    if (!/^\d{6,12}$/.test(numeroDocumento)) errores.numeroDocumento = "El documento debe tener entre 6 y 12 números.";
    if (!direccion.trim() || direccion.trim().length < 5) errores.direccion = "Ingresa una dirección válida.";
    if (!/^\d{7,10}$/.test(telefono)) errores.telefono = "El teléfono debe tener entre 7 y 10 números.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errores.email = "Ingresa un correo electrónico válido.";
    if (password.length < 8) errores.password = "La contraseña debe tener mínimo 8 caracteres.";
    if (password !== confirmarPassword) errores.confirmarPassword = "Las contraseñas no coinciden.";

    if (Object.keys(errores).length > 0) {
      setErroresNuevoUsuario(errores);
      return;
    }

    try {
      await API.post("/usuarios", {
        nombre: nombre.trim(), apellido: apellido.trim(), tipoDocumento, numeroDocumento: numeroDocumento.trim(),
        direccion: direccion.trim(), telefono: telefono.trim(), email: email.trim().toLowerCase(), rol, password,
      });
      setMostrarModalNuevoUsuario(false);
      setMensajeExito("Usuario creado correctamente.");
      obtenerUsuarios();
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      // Error visible DENTRO del modal para que el usuario sepa por qué falló
      setErroresNuevoUsuario((actual) => ({
        ...actual,
        general: err.response?.data?.error || "Error al crear el usuario. Revisa los datos e inténtalo de nuevo.",
      }));
    }
  };

  // ==========================================
  // MANEJO DE INPUTS
  // ==========================================
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setFormulario({
      nombre: "",
      marca: "",
      precio: "",
      categoria: "",
      imagen: "",
      descripcion: "",
      potencia: "",
      motor: "",
      transmision: "",
      aplicacion: "",
    });
    setArchivoImagen(null);
    setMostrarModal(true);
  };

  // Abrir modal para editar (Cargar datos)
  const abrirModalEditar = (modelo) => {
    setModoEdicion(true);
    setIdEditando(modelo._id || modelo.id);
    setFormulario({
      nombre: modelo.nombre || "",
      marca: modelo.marca || "",
      precio: modelo.precio || "",
      categoria: modelo.categoria || "",
      imagen: modelo.imagen || "",
      descripcion: modelo.descripcion || "",
      potencia: modelo.potencia || "",
      motor: modelo.motor || "",
      transmision: modelo.transmision || "",
      aplicacion: modelo.aplicacion || "",
    });
    setArchivoImagen(null);
    setMostrarModal(true);
  };

  // ==========================================
  // 2. CREAR Y ACTUALIZAR (CREATE / UPDATE)
  // ==========================================
  const guardarModelo = async (e) => {
    e.preventDefault();
    setError("");

    if (!formulario.nombre || !formulario.precio) {
      setError("El nombre y el precio son obligatorios.");
      return;
    }

    try {
      const datos = new FormData();
      Object.entries(formulario).forEach(([campo, valor]) => {
        if (campo !== "imagen") datos.append(campo, valor ?? "");
      });
      if (archivoImagen) datos.append("imagen", archivoImagen);
      if (modoEdicion) {
        // ACTUALIZAR (PUT)
        await API.put(`/productos/${idEditando}`, datos);
        setMensajeExito("Modelo actualizado exitosamente.");
      } else {
        // CREAR (POST)
        await API.post("/productos", datos);
        setMensajeExito("Nuevo modelo agregado exitosamente.");
      }

      setMostrarModal(false);
      obtenerModelos();
      setTimeout(() => setMensajeExito(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al guardar.");
    }
  };

  // ==========================================
  // 3. ELIMINAR (DELETE)
  // ==========================================
  const eliminarModelo = async (id) => {
    setTituloConfirmacion("Eliminar modelo");
    setMensajeConfirmacion("¿Estás seguro de que deseas eliminar este modelo? Esta acción no se puede deshacer.");
    setConfirmacionPendiente(() => async () => {
      try {
        await API.delete(`/productos/${id}`);
        setMensajeExito("Modelo eliminado correctamente.");
        obtenerModelos();
        setTimeout(() => setMensajeExito(""), 3000);
      } catch {
        setError("Error al eliminar el modelo.");
      }
    });
    setMostrarConfirmacion(true);
  };

  // Filtrar modelos por búsqueda
  const modelosFiltrados = modelos.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (m.marca && m.marca.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <aside className="sticky top-24 hidden h-fit w-60 shrink-0 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-xl md:block">
        <div className="border-b border-white/10 px-3 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Road Master</p>
          <p className="mt-2 text-lg font-black text-white">Administración</p>
        </div>
        <nav className="mt-4 space-y-1" aria-label="Navegación administrativa">
          <a href="#resumen-admin" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-600/15 hover:text-white">Resumen</a>
          <a href="#usuarios-admin" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-600/15 hover:text-white">Usuarios</a>
          <a href="#productos-admin" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-600/15 hover:text-white">Productos</a>
          <a href="#servicios-admin" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-600/15 hover:text-white">Servicios</a>
          <div className="my-3 border-t border-white/10" />
          <a href="/" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-red-600/15 hover:text-white">🌐 Ver página web</a>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
      {/* HEADER DEL PANEL */}
      <div id="resumen-admin" className="flex scroll-mt-28 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-red-500">Panel de Administración</h1>
          <p className="mt-1 text-slate-400">Gestión global del catálogo de vehículos y modelos.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={abrirModalNuevoUsuario}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-bold text-white transition hover:bg-slate-700"
          >
            + Nuevo Usuario
          </button>
          <button
            onClick={abrirModalCrear}
            className="rounded-lg bg-red-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
          >
            + Agregar Nuevo Modelo
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <TarjetaMetrica etiqueta="Usuarios totales" valor={usuarios.length} color="text-white" icono={Users} />
        <TarjetaMetrica
          etiqueta="Usuarios activos"
          valor={usuarios.filter((usuario) => usuario.estado === "activo").length}
          color="text-green-400"
          icono={UserCheck}
        />
        <TarjetaMetrica etiqueta="Modelos registrados" valor={modelos.length} color="text-red-400" icono={Truck} />
      </div>

      <section id="usuarios-admin" className="mt-8 scroll-mt-28 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-xl font-bold text-white">Usuarios registrados</h2>
          <p className="mt-1 text-sm text-slate-400">Consulta, activa o desactiva las cuentas de la plataforma.</p>
        </div>
        {usuarios.length === 0 ? (
          <p className="p-6 text-slate-400">No hay usuarios registrados.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 font-semibold text-white">{usuario.nombre} {usuario.apellido}</td>
                  <td className="px-6 py-4">{usuario.email}</td>
                  <td className="px-6 py-4 capitalize">{usuario.rol}</td>
                  <td className="px-6 py-4 capitalize">{usuario.estado}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => cambiarEstadoUsuario(usuario)} className="mr-2 rounded border border-blue-500/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-600 hover:text-white">
                      {usuario.estado === "activo" ? "Desactivar" : "Activar"}
                    </button>
                    <button type="button" onClick={() => abrirModalEditarUsuario(usuario)} className="mr-2 rounded border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-600 hover:text-white">
                      Editar
                    </button>
                    <button type="button" onClick={() => eliminarUsuario(usuario)} className="rounded border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-600 hover:text-white">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* MENSAJES DE NOTIFICACIÓN */}
      {mensajeExito && (
        <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Buscar por nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-red-500"
        />
      </div>

      {/* TABLA DE PRODUCTOS / MODELOS */}
      <div id="productos-admin" className="mt-8 scroll-mt-28 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        {cargando ? (
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
                return (
                  <tr key={id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <img
                        src={modelo.imagen || "https://via.placeholder.com/60"}
                        alt={modelo.nombre}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "https://via.placeholder.com/60";
                        }}
                        className="h-12 w-12 rounded-md object-cover border border-white/10"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{modelo.nombre}</td>
                    <td className="px-6 py-4">{modelo.marca || "N/A"}</td>
                    <td className="px-6 py-4">{modelo.categoria || "N/A"}</td>
                    <td className="px-6 py-4 font-semibold text-red-400">
                      ${Number(modelo.precio).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(modelo)}
                          className="rounded bg-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarModelo(id)}
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

      <section id="servicios-admin" className="mt-8 scroll-mt-28 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Servicios</h2>
            <p className="mt-1 text-sm text-slate-400">Administra los servicios disponibles para los clientes.</p>
          </div>
          <button type="button" onClick={() => abrirModalServicio()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            Agregar servicio
          </button>
        </div>
        {servicios.length === 0 ? (
          <p className="p-6 text-slate-400">No hay servicios registrados.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400">
              <tr><th className="px-6 py-4">Nombre</th><th className="px-6 py-4">Descripción</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4 text-right">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td className="px-6 py-4 font-semibold text-white">{servicio.nombre}</td>
                  <td className="px-6 py-4">{servicio.descripcion || "Sin descripción"}</td>
                  <td className="px-6 py-4 text-red-400">${Number(servicio.precio).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => abrirModalServicio(servicio)} className="mr-2 rounded border border-blue-500/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-600 hover:text-white">Editar</button>
                    <button type="button" onClick={() => eliminarServicio(servicio)} className="rounded border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-600 hover:text-white">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* MODAL PARA CREAR USUARIO (ADMIN) */}
      {mostrarModalNuevoUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Crear usuario</h2>
            <p className="mt-1 text-xs text-slate-400">El correo y el número de documento deben ser únicos en la base de datos.</p>
            {erroresNuevoUsuario.general && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-300">
                ⚠️ {erroresNuevoUsuario.general}
              </div>
            )}
            <form onSubmit={crearUsuario} className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["nombre", "Nombre"], ["apellido", "Apellido"], ["numeroDocumento", "Número de documento"],
                ["direccion", "Dirección"], ["telefono", "Teléfono"], ["email", "Correo electrónico"],
              ].map(([name, label]) => (
                <label key={name} className="block text-xs font-semibold uppercase text-slate-400">
                  {label}
                  <input
                    name={name}
                    type={name === "email" ? "email" : "text"}
                    value={formularioNuevoUsuario[name]}
                    onChange={manejarCambioNuevoUsuario}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
                  />
                  {erroresNuevoUsuario[name] && (
                    <span className="mt-1 block text-xs normal-case text-red-400">{erroresNuevoUsuario[name]}</span>
                  )}
                </label>
              ))}
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Tipo de documento
                <select name="tipoDocumento" value={formularioNuevoUsuario.tipoDocumento} onChange={manejarCambioNuevoUsuario} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500">
                  <option value="CC">CC</option>
                  <option value="TI">TI</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Rol
                <select name="rol" value={formularioNuevoUsuario.rol} onChange={manejarCambioNuevoUsuario} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500">
                  <option value="cliente">Cliente</option>
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Contraseña
                <input name="password" type="password" value={formularioNuevoUsuario.password} onChange={manejarCambioNuevoUsuario} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500" />
                {erroresNuevoUsuario.password && (
                  <span className="mt-1 block text-xs normal-case text-red-400">{erroresNuevoUsuario.password}</span>
                )}
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Confirmar contraseña
                <input name="confirmarPassword" type="password" value={formularioNuevoUsuario.confirmarPassword} onChange={manejarCambioNuevoUsuario} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500" />
                {erroresNuevoUsuario.confirmarPassword && (
                  <span className="mt-1 block text-xs normal-case text-red-400">{erroresNuevoUsuario.confirmarPassword}</span>
                )}
              </label>
              <div className="col-span-full flex justify-end gap-3 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setMostrarModalNuevoUsuario(false)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">Crear usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR */}
      {mostrarModalUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Editar usuario</h2>
            <form onSubmit={guardarUsuario} className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["nombre", "Nombre"], ["apellido", "Apellido"], ["numeroDocumento", "Número de documento"],
                ["direccion", "Dirección"], ["telefono", "Teléfono"], ["email", "Correo electrónico"],
              ].map(([name, label]) => (
                <label key={name} className="block text-xs font-semibold uppercase text-slate-400">
                  {label}
                  <input
                    name={name}
                    type={name === "email" ? "email" : "text"}
                    value={formularioUsuario[name]}
                    onChange={manejarCambioUsuario}
                    required
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500"
                  />
                </label>
              ))}
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Tipo de documento
                <select name="tipoDocumento" value={formularioUsuario.tipoDocumento} onChange={manejarCambioUsuario} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500">
                  <option value="CC">CC</option>
                  <option value="TI">TI</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                </select>
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Rol
                <select name="rol" value={formularioUsuario.rol} onChange={manejarCambioUsuario} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500">
                  <option value="cliente">Cliente</option>
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <div className="col-span-full flex justify-end gap-3 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setMostrarModalUsuario(false)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalServicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">{servicioEditando ? "Editar servicio" : "Agregar servicio"}</h2>
            <form onSubmit={guardarServicio} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase text-slate-400">Nombre
                <input name="nombre" value={formularioServicio.nombre} onChange={manejarCambioServicio} required maxLength={120} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500" />
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-400">Precio
                <input name="precio" type="number" min="0" step="0.01" value={formularioServicio.precio} onChange={manejarCambioServicio} required className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500" />
              </label>
              <label className="block text-xs font-semibold uppercase text-slate-400">Descripción
                <textarea name="descripcion" value={formularioServicio.descripcion} onChange={manejarCambioServicio} rows="3" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm normal-case text-white outline-none focus:border-red-500" />
              </label>
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setMostrarModalServicio(false)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                <button type="submit" className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            {/* Icono de advertencia */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-5 text-center text-xl font-bold text-white">{tituloConfirmacion}</h2>
            <p className="mt-3 text-center text-sm text-slate-400 leading-relaxed">{mensajeConfirmacion}</p>
            <div className="mt-7 flex justify-center gap-4">
              <button
                onClick={() => {
                  setMostrarConfirmacion(false);
                  setConfirmacionPendiente(null);
                }}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (confirmacionPendiente) await confirmacionPendiente();
                  setMostrarConfirmacion(false);
                  setConfirmacionPendiente(null);
                }}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">
              {modoEdicion ? "Editar Modelo" : "Agregar Nuevo Modelo"}
            </h2>

            <form onSubmit={guardarModelo} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Marca</label>
                  <input
                    type="text"
                    name="marca"
                    value={formulario.marca}
                    onChange={manejarCambio}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={formulario.precio}
                    onChange={manejarCambio}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    value={formulario.categoria}
                    onChange={manejarCambio}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Imagen del modelo</label>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                    required={!modoEdicion}
                  />
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG o WEBP. Máximo 5 MB.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
                >
                  {modoEdicion ? "Guardar Cambios" : "Crear Modelo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}