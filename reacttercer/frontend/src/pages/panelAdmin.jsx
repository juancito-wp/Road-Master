import { useState, useEffect } from "react";
import API from "../api/axios";
import useModuloComercial from "../hooks/useModuloComercial";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import ResumenAdmin from "../components/admin/ResumenAdmin";
import UsuariosAdmin from "../components/admin/UsuariosAdmin";
import ProductosAdmin from "../components/admin/ProductosAdmin";
import ServiciosAdmin from "../components/admin/ServiciosAdmin";
import DashboardVentas from "../components/panel/DashboardVentas";
import FormularioVenta from "../components/panel/FormularioVenta";
import GestionFacturas from "../components/panel/GestionFacturas";
import GestionPqr from "../components/panel/GestionPqr";
import HistorialVentas from "../components/panel/HistorialVentas";
import ReporteDiario from "../components/panel/ReporteDiario";

export default function PanelAdmin() {
  const [seccionActiva, setSeccionActiva] = useState("resumen");
  const comercial = useModuloComercial();
  const [mostrarFormularioVenta, setMostrarFormularioVenta] = useState(false);

  const [modelos, setModelos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // Usuarios
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formularioUsuario, setFormularioUsuario] = useState({
    nombre: "", apellido: "", tipoDocumento: "CC", numeroDocumento: "",
    direccion: "", telefono: "", email: "", rol: "cliente",
  });
  const [mostrarModalNuevoUsuario, setMostrarModalNuevoUsuario] = useState(false);
  const [formularioNuevoUsuario, setFormularioNuevoUsuario] = useState({
    nombre: "", apellido: "", tipoDocumento: "CC", numeroDocumento: "",
    direccion: "", telefono: "", email: "", rol: "cliente",
    password: "", confirmarPassword: "",
  });
  const [erroresNuevoUsuario, setErroresNuevoUsuario] = useState({});

  // Solicitudes
  const [solicitudes, setSolicitudes] = useState([]);

  // Servicios
  const [servicios, setServicios] = useState([]);
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formularioServicio, setFormularioServicio] = useState({
    nombre: "", descripcion: "", precio: "",
  });

  // Productos
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: "", marca: "", precio: "", categoria: "", imagen: "",
    descripcion: "", potencia: "", motor: "", transmision: "", aplicacion: "",
  });
  const [archivoImagen, setArchivoImagen] = useState(null);

  // Confirmación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(null);
  const [tituloConfirmacion, setTituloConfirmacion] = useState("");
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");

  // ==========================================
  // OBTENER DATOS
  // ==========================================
  const obtenerModelos = async () => {
    try {
      const res = await API.get("/productos");
      setModelos(res.data);
      setError("");
    } catch {
      setError("Error al cargar la lista de modelos. Intenta nuevamente.");
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

  const obtenerSolicitudes = async () => {
    try {
      const res = await API.get("/solicitudes");
      setSolicitudes(res.data || []);
    } catch {
      // Silenciar — las solicitudes son opcionales para el resumen
    }
  };

  useEffect(() => {
    obtenerModelos();
    obtenerUsuarios();
    obtenerServicios();
    obtenerSolicitudes();
    comercial.cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // USUARIOS
  // ==========================================
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
      nombre: usuario.nombre || "", apellido: usuario.apellido || "",
      tipoDocumento: usuario.tipoDocumento || "CC", numeroDocumento: usuario.numeroDocumento || "",
      direccion: usuario.direccion || "", telefono: usuario.telefono || "",
      email: usuario.email || "", rol: usuario.rol || "cliente",
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
      setErroresNuevoUsuario((actual) => ({
        ...actual,
        general: err.response?.data?.error || "Error al crear el usuario. Revisa los datos e inténtalo de nuevo.",
      }));
    }
  };

  // ==========================================
  // SERVICIOS
  // ==========================================
  const abrirModalServicio = (servicio = null) => {
    setServicioEditando(servicio);
    setFormularioServicio({
      nombre: servicio?.nombre || "", descripcion: servicio?.descripcion || "", precio: servicio?.precio || "",
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
  // PRODUCTOS / MODELOS
  // ==========================================
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setFormulario({
      nombre: "", marca: "", precio: "", categoria: "", imagen: "",
      descripcion: "", potencia: "", motor: "", transmision: "", aplicacion: "",
    });
    setArchivoImagen(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (modelo) => {
    setModoEdicion(true);
    setIdEditando(modelo._id || modelo.id);
    setFormulario({
      nombre: modelo.nombre || "", marca: modelo.marca || "", precio: modelo.precio || "",
      categoria: modelo.categoria || "", imagen: modelo.imagen || "", descripcion: modelo.descripcion || "",
      potencia: modelo.potencia || "", motor: modelo.motor || "", transmision: modelo.transmision || "",
      aplicacion: modelo.aplicacion || "",
    });
    setArchivoImagen(null);
    setMostrarModal(true);
  };

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
        await API.put(`/productos/${idEditando}`, datos);
        setMensajeExito("Modelo actualizado exitosamente.");
      } else {
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

  // ==========================================
  // RENDERIZADO DE SECCIÓN
  // ==========================================
  const renderizarSeccion = () => {
    switch (seccionActiva) {
      case "resumen":
        return (
          <ResumenAdmin
            usuarios={usuarios}
            modelos={modelos}
            servicios={servicios}
            solicitudes={solicitudes}
            estadisticas={comercial.estadisticas}
          />
        );
      case "dashboard":
        return (
          <DashboardVentas
            estadisticas={comercial.estadisticasVentas}
            filtros={comercial.filtrosEstadisticas}
            onAplicarFiltros={comercial.setFiltrosEstadisticas}
            productos={modelos}
            servicios={servicios}
            clientes={comercial.clientes}
            mostrarClientes
          />
        );
      case "ventas":
        return (
          <HistorialVentas
            ventas={comercial.ventas}
            facturas={comercial.facturas}
            filtros={comercial.filtrosVentas}
            onAplicarFiltros={comercial.setFiltrosVentas}
            onFacturar={(venta) => comercial.generarFactura(venta.id)}
            onCambiarEstado={comercial.cambiarEstadoVenta}
            onNuevaVenta={() => setMostrarFormularioVenta(true)}
            puedeGestionar
            puedeFacturar
            productos={modelos}
            servicios={servicios}
            clientes={comercial.clientes}
            mostrarClientes
          />
        );
      case "facturas":
        return (
          <GestionFacturas
            facturas={comercial.facturas}
            filtros={comercial.filtrosFacturas}
            onAplicarFiltros={comercial.setFiltrosFacturas}
            onDescargar={comercial.descargarFacturaPdf}
            onCambiarEstado={comercial.cambiarEstadoFactura}
            puedeGestionar
          />
        );
      case "reportes":
        return (
          <ReporteDiario
            hoy={comercial.hoy}
            onConsultar={comercial.consultarReporteDiario}
            onDescargar={comercial.descargarReporteDiario}
          />
        );
      case "pqr":
        return (
          <GestionPqr
            pqr={comercial.pqr}
            resumenPqr={comercial.resumenPqr}
            filtros={comercial.filtrosPqr}
            onAplicarFiltros={comercial.setFiltrosPqr}
            rol="admin"
            onRegistrar={comercial.registrarPqr}
            onCambiarEstado={comercial.cambiarEstadoPqr}
            onResponder={comercial.responderPqr}
          />
        );
      case "usuarios":
        return (
          <UsuariosAdmin
            usuarios={usuarios}
            onCambiarEstado={cambiarEstadoUsuario}
            onEditar={abrirModalEditarUsuario}
            onEliminar={eliminarUsuario}
            onNuevo={abrirModalNuevoUsuario}
          />
        );
      case "productos":
        return (
          <ProductosAdmin
            modelos={modelos}
            productoMasCaro={modelos.length > 0 ? modelos.reduce((max, m) => Number(m.precio) > Number(max.precio) ? m : max) : null}
            onCrear={abrirModalCrear}
            onEditar={abrirModalEditar}
            onEliminar={eliminarModelo}
          />
        );
      case "servicios":
        return (
          <ServiciosAdmin
            servicios={servicios}
            onCrear={abrirModalServicio}
            onEditar={abrirModalServicio}
            onEliminar={eliminarServicio}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarAdmin seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} />

      <div className="ml-64 flex-1 p-6 lg:p-8">
        {(mensajeExito || comercial.mensaje) && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            {mensajeExito || comercial.mensaje}
          </div>
        )}

        {(error || comercial.error) && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error || comercial.error}
          </div>
        )}

        {renderizarSeccion()}
      </div>

      {mostrarFormularioVenta && (
        <FormularioVenta
          productos={modelos}
          servicios={servicios}
          clientes={comercial.clientes}
          onRegistrar={comercial.registrarVenta}
          onCerrar={() => setMostrarFormularioVenta(false)}
        />
      )}

      {/* MODAL CREAR USUARIO */}
      {mostrarModalNuevoUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">Crear usuario</h2>
            <p className="mt-1 text-xs text-slate-400">El correo y el número de documento deben ser únicos en la base de datos.</p>
            {erroresNuevoUsuario.general && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-300">
                {erroresNuevoUsuario.general}
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

      {/* MODAL EDITAR USUARIO */}
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

      {/* MODAL SERVICIO */}
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

      {/* MODAL CONFIRMACIÓN ELIMINACIÓN */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600/15">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-5 text-center text-xl font-bold text-white">{tituloConfirmacion}</h2>
            <p className="mt-3 text-center text-sm text-slate-400 leading-relaxed">{mensajeConfirmacion}</p>
            <div className="mt-7 flex justify-center gap-4">
              <button
                onClick={() => { setMostrarConfirmacion(false); setConfirmacionPendiente(null); }}
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

      {/* MODAL CREAR / EDITAR MODELO */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white">
              {modoEdicion ? "Editar Modelo" : "Agregar Nuevo Modelo"}
            </h2>
            <form onSubmit={guardarModelo} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Nombre</label>
                <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Marca</label>
                  <input type="text" name="marca" value={formulario.marca} onChange={manejarCambio}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Precio</label>
                  <input type="number" name="precio" value={formulario.precio} onChange={manejarCambio}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Categoría</label>
                  <input type="text" name="categoria" value={formulario.categoria} onChange={manejarCambio}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase">Imagen del modelo</label>
                  <input type="file" name="imagen" accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500"
                    required={!modoEdicion} />
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG o WEBP. Máximo 5 MB.</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase">Descripción</label>
                <textarea name="descripcion" rows="3" value={formulario.descripcion} onChange={manejarCambio}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-red-500" />
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setMostrarModal(false)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10">Cancelar</button>
                <button type="submit"
                  className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">
                  {modoEdicion ? "Guardar Cambios" : "Crear Modelo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
