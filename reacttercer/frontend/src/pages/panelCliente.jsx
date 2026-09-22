import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import useModuloComercial from '../hooks/useModuloComercial';
import SidebarCliente from '../components/cliente/SidebarCliente';
import ResumenCliente from '../components/cliente/ResumenCliente';
import PerfilCliente from '../components/cliente/PerfilCliente';
import CotizacionCliente from '../components/cliente/CotizacionCliente';
import FormularioVenta from '../components/panel/FormularioVenta';
import GestionFacturas from '../components/panel/GestionFacturas';
import GestionPqr from '../components/panel/GestionPqr';
import HistorialVentas from '../components/panel/HistorialVentas';

const normalizarTexto = (texto) => String(texto ?? '').trim().toLowerCase();

// Busca en el catálogo el vehículo que el cliente eligió en la página de modelos
const resolverModeloCatalogo = (lista, intencion) => {
  if (!intencion) return null;

  if (intencion.modeloId != null) {
    const porId = (lista ?? []).find((modelo) => String(modelo.id) === String(intencion.modeloId));
    if (porId) return porId;
  }

  if (!intencion.modeloNombre) return null;

  return (
    (lista ?? []).find(
      (modelo) => normalizarTexto(modelo.nombre) === normalizarTexto(intencion.modeloNombre)
    ) ?? null
  );
};

export default function PanelCliente() {
  const location = useLocation();

  // Intención enviada desde el catálogo público ("Cotizar este modelo")
  const [intencionCatalogo] = useState(() =>
    location.state?.seccion === 'cotizacion' ? location.state : null
  );

  const [seccionActiva, setSeccionActiva] = useState(intencionCatalogo ? 'cotizacion' : 'resumen');
  const [modeloCatalogo, setModeloCatalogo] = useState(null);
  const comercial = useModuloComercial();
  const [mostrarFormularioVenta, setMostrarFormularioVenta] = useState(false);

  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    telefono: '',
  });

  const [modelos, setModelos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cotizacion, setCotizacion] = useState({
    modeloId: '',
    tipoServicio: 'Cotización',
    comentarios: '',
  });

  const [cargando, setCargando] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState('');
  const [mensajeCotizacion, setMensajeCotizacion] = useState('');
  const [error, setError] = useState('');

  // ==========================================
  // OBTENER DATOS
  // ==========================================
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    setUsuario({
      nombre: usuarioGuardado.nombre || localStorage.getItem('nombreUsuario') || '',
      apellido: usuarioGuardado.apellido || '',
      email: usuarioGuardado.email || '',
      direccion: usuarioGuardado.direccion || '',
      telefono: usuarioGuardado.telefono || '',
    });

    const cargarDatos = async () => {
      try {
        const [resModelos, resServicios] = await Promise.all([
          API.get('/productos'),
          API.get('/servicios'),
        ]);
        setModelos(resModelos.data || []);
        setServicios(resServicios.data || []);

        // Preselecciona el vehículo que el cliente eligió desde la página de modelos
        const modelo = resolverModeloCatalogo(resModelos.data, intencionCatalogo);
        if (modelo) {
          setModeloCatalogo(modelo.nombre);
          setCotizacion((prev) => ({ ...prev, modeloId: String(modelo.id) }));
        } else if (intencionCatalogo) {
          setError(
            'El vehículo que elegiste en el catálogo ya no está disponible. Selecciona otro modelo.'
          );
        }
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo cargar el catálogo de vehículos.');
      }
    };

    cargarDatos();
  }, [intencionCatalogo]);

  // ==========================================
  // PERFIL
  // ==========================================
  const manejarCambioPerfil = (e) => {
    const { name, value } = e.target;
    const nuevoValor = name === 'telefono' ? value.replace(/\D/g, '') : value;
    setUsuario((prev) => ({ ...prev, [name]: nuevoValor }));
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setMensajePerfil('');
    setError('');

    if (!usuario.nombre.trim() || !usuario.apellido.trim() || !usuario.direccion.trim() || !/^\d{7,10}$/.test(usuario.telefono)) {
      setError('Completa nombre, apellido, dirección y un teléfono válido de 7 a 10 dígitos.');
      return;
    }

    try {
      setCargando(true);
      await API.put('/usuarios/perfil', usuario);

      localStorage.setItem('nombreUsuario', usuario.nombre);
      const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
      localStorage.setItem('usuarioActual', JSON.stringify({ ...usuarioActual, ...usuario }));

      setMensajePerfil('Perfil actualizado correctamente.');
      setTimeout(() => setMensajePerfil(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil.');
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // COTIZACIÓN
  // ==========================================
  const manejarCambioCotizacion = (e) => {
    const { name, value } = e.target;
    setCotizacion((prev) => ({ ...prev, [name]: value }));
  };

  const enviarCotizacion = async (e) => {
    e.preventDefault();
    setMensajeCotizacion('');
    setError('');

    if (!modelos.length) {
      setError('No hay modelos disponibles para realizar una solicitud en este momento.');
      return;
    }

    if (!cotizacion.modeloId) {
      setError('Selecciona un modelo válido para continuar.');
      return;
    }

    try {
      setCargando(true);
      await API.post('/solicitudes', {
        ...cotizacion,
        cliente: usuario.nombre,
        email: usuario.email,
      });

      setMensajeCotizacion('¡Solicitud enviada con éxito! Un asesor te contactará pronto.');
      setCotizacion({ modeloId: '', tipoServicio: 'Cotización', comentarios: '' });
      setModeloCatalogo(null);
      setTimeout(() => setMensajeCotizacion(''), 4000);
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'Error al enviar la cotización.';
      const detalleAmigable = mensajeError.includes('no existe')
        ? 'El modelo seleccionado ya no está disponible. Elige otro vehículo de la lista.'
        : mensajeError.includes('válidos')
          ? 'Revisa los datos de la solicitud antes de enviarla.'
          : mensajeError;

      setError(detalleAmigable);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // RENDERIZADO DE SECCIÓN
  // ==========================================
  const renderizarSeccion = () => {
    switch (seccionActiva) {
      case 'resumen':
        return (
          <ResumenCliente
            nombre={usuario.nombre}
            modelos={modelos}
            servicios={servicios}
            estadisticas={comercial.estadisticas}
          />
        );
      case 'compra':
        return (
          <HistorialVentas
            ventas={comercial.ventas}
            facturas={comercial.facturas}
            filtros={comercial.filtrosVentas}
            onAplicarFiltros={comercial.setFiltrosVentas}
            onFacturar={(venta) => comercial.generarFactura(venta.id)}
            onNuevaVenta={() => setMostrarFormularioVenta(true)}
            puedeFacturar
            productos={modelos}
            servicios={servicios}
          />
        );
      case 'facturas':
        return (
          <GestionFacturas
            facturas={comercial.facturas}
            filtros={comercial.filtrosFacturas}
            onAplicarFiltros={comercial.setFiltrosFacturas}
            onDescargar={comercial.descargarFacturaPdf}
            onCambiarEstado={comercial.cambiarEstadoFactura}
          />
        );
      case 'pqr':
        return (
          <GestionPqr
            pqr={comercial.pqr}
            resumenPqr={comercial.resumenPqr}
            filtros={comercial.filtrosPqr}
            onAplicarFiltros={comercial.setFiltrosPqr}
            rol="cliente"
            onRegistrar={comercial.registrarPqr}
            onCambiarEstado={comercial.cambiarEstadoPqr}
            onResponder={comercial.responderPqr}
          />
        );
      case 'perfil':
        return (
          <PerfilCliente
            usuario={usuario}
            cargando={cargando}
            mensaje={mensajePerfil}
            onChange={manejarCambioPerfil}
            onSubmit={actualizarPerfil}
          />
        );
      case 'cotizacion':
        return (
          <CotizacionCliente
            modelos={modelos}
            cotizacion={cotizacion}
            cargando={cargando}
            mensaje={mensajeCotizacion}
            modeloPreseleccionado={modeloCatalogo}
            onChange={manejarCambioCotizacion}
            onSubmit={enviarCotizacion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarCliente seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} />

      <div className="flex-1 p-4 pt-6 sm:p-6 lg:ml-64 lg:p-8">
        {comercial.mensaje && (
          <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            {comercial.mensaje}
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
          clienteFijo
          onRegistrar={comercial.registrarVenta}
          onCerrar={() => setMostrarFormularioVenta(false)}
        />
      )}
    </div>
  );
}
