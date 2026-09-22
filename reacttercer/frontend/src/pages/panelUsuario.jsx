import { useEffect, useState } from 'react';
import API from '../api/axios';
import useModuloComercial from '../hooks/useModuloComercial';
import SidebarEmpleado from '../components/empleado/SidebarEmpleado';
import ResumenEmpleado from '../components/empleado/ResumenEmpleado';
import SolicitudesEmpleado from '../components/empleado/SolicitudesEmpleado';
import CatalogoEmpleado from '../components/empleado/CatalogoEmpleado';
import DashboardVentas from '../components/panel/DashboardVentas';
import FormularioVenta from '../components/panel/FormularioVenta';
import GestionPqr from '../components/panel/GestionPqr';
import HistorialVentas from '../components/panel/HistorialVentas';

export default function PanelUsuario() {
  const nombre = localStorage.getItem('nombreUsuario') || 'Empleado';

  const [seccionActiva, setSeccionActiva] = useState('resumen');
  const comercial = useModuloComercial();
  const [mostrarFormularioVenta, setMostrarFormularioVenta] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // ==========================================
  // OBTENER DATOS
  // ==========================================
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resSolicitudes, resModelos] = await Promise.all([
        API.get('/solicitudes'),
        API.get('/productos'),
      ]);

      setSolicitudes(resSolicitudes.data || []);
      setModelos(resModelos.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los datos del empleado.');
    } finally {
      setCargando(false);
    }
  };

  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    cargarDatos();
    API.get('/servicios').then((res) => setServicios(res.data || [])).catch(() => setServicios([]));
    comercial.cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // SOLICITUDES
  // ==========================================
  const cambiarEstado = async (id, estado) => {
    try {
      await API.patch(`/solicitudes/${id}/estado`, { estado });
      setSolicitudes((actuales) =>
        actuales.map((solicitud) =>
          solicitud.id === id ? { ...solicitud, estado } : solicitud
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar el estado.');
    }
  };

  // ==========================================
  // RENDERIZADO DE SECCIÓN
  // ==========================================
  const renderizarSeccion = () => {
    switch (seccionActiva) {
      case 'resumen':
        return (
          <ResumenEmpleado
            solicitudes={solicitudes}
            modelos={modelos}
            nombre={nombre}
            estadisticas={comercial.estadisticas}
          />
        );
      case 'dashboard':
        return (
          <DashboardVentas
            estadisticas={comercial.estadisticasVentas}
            filtros={comercial.filtrosEstadisticas}
            onAplicarFiltros={comercial.setFiltrosEstadisticas}
            productos={modelos}
            servicios={servicios}
            clientes={comercial.clientes}
            mostrarClientes
            titulo="Dashboard de ventas del empleado"
            descripcion="Analiza el comportamiento de las ventas y registra nuevas operaciones comerciales."
          />
        );
      case 'ventas':
        return (
          <HistorialVentas
            ventas={comercial.ventas}
            facturas={comercial.facturas}
            filtros={comercial.filtrosVentas}
            onAplicarFiltros={comercial.setFiltrosVentas}
            onFacturar={(venta) => comercial.generarFactura(venta.id)}
            onCambiarEstado={comercial.cambiarEstadoVenta}
            onNuevaVenta={() => setMostrarFormularioVenta(true)}
            puedeFacturar
            productos={modelos}
            servicios={servicios}
            clientes={comercial.clientes}
            mostrarClientes
          />
        );
      case 'pqr':
        return (
          <GestionPqr
            pqr={comercial.pqr}
            resumenPqr={comercial.resumenPqr}
            filtros={comercial.filtrosPqr}
            onAplicarFiltros={comercial.setFiltrosPqr}
            rol="empleado"
            onRegistrar={comercial.registrarPqr}
            onCambiarEstado={comercial.cambiarEstadoPqr}
            onResponder={comercial.responderPqr}
          />
        );
      case 'solicitudes':
        return (
          <SolicitudesEmpleado
            solicitudes={solicitudes}
            cargando={cargando}
            filtro={filtro}
            onCambiarFiltro={setFiltro}
            onCambiarEstado={cambiarEstado}
          />
        );
      case 'productos':
        return <CatalogoEmpleado modelos={modelos} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <SidebarEmpleado seccionActiva={seccionActiva} onCambiarSeccion={setSeccionActiva} />

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
          clientes={comercial.clientes}
          onRegistrar={comercial.registrarVenta}
          onCerrar={() => setMostrarFormularioVenta(false)}
        />
      )}
    </div>
  );
}
