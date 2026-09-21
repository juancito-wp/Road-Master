import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import { descargarArchivo, hoyISO, inicioMesISO } from '../utils/formato';

/** Quita los filtros vacíos para no enviar parámetros innecesarios al backend. */
const paramsLimpiar = (filtros) =>
  Object.fromEntries(Object.entries(filtros || {}).filter(([, valor]) => valor !== '' && valor != null));

/**
 * Hook compartido por los paneles administrativo, de empleado y de cliente:
 * carga ventas, facturas, PQR y estadísticas, y expone las acciones del módulo comercial.
 */
export default function useModuloComercial() {
  const [ventas, setVentas] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [pqr, setPqr] = useState([]);
  const [resumenPqr, setResumenPqr] = useState({});
  const [estadisticas, setEstadisticas] = useState({ cards: [], temporal: [], estados: {} });
  const [estadisticasVentas, setEstadisticasVentas] = useState({ cards: [], temporal: [], productos: [], filtros: {} });
  const [clientes, setClientes] = useState([]);
  const [filtrosVentas, setFiltrosVentas] = useState({});
  const [filtrosFacturas, setFiltrosFacturas] = useState({});
  const [filtrosPqr, setFiltrosPqr] = useState({});
  const [filtrosEstadisticas, setFiltrosEstadisticas] = useState({
    fechaInicio: inicioMesISO(), fechaFin: hoyISO(), agrupacion: 'dia',
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const avisar = useCallback((texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3500);
  }, []);

  const manejarError = useCallback((err, respaldo) => {
    const texto = err.response?.data?.error || respaldo;
    setError(texto);
    setTimeout(() => setError(''), 5000);
    return false;
  }, []);

  const cargarVentas = useCallback(async () => {
    try {
      const res = await API.get('/ventas', { params: paramsLimpiar(filtrosVentas) });
      setVentas(res.data.ventas || []);
    } catch (err) {
      manejarError(err, 'No se pudo cargar el historial de ventas.');
    }
  }, [filtrosVentas, manejarError]);

  const cargarFacturas = useCallback(async () => {
    try {
      const res = await API.get('/facturas', { params: paramsLimpiar(filtrosFacturas) });
      setFacturas(res.data.facturas || []);
    } catch (err) {
      manejarError(err, 'No se pudieron cargar las facturas.');
    }
  }, [filtrosFacturas, manejarError]);

  const cargarPqr = useCallback(async () => {
    try {
      const res = await API.get('/pqr', { params: paramsLimpiar(filtrosPqr) });
      setPqr(res.data.pqr || []);
      setResumenPqr(res.data.resumen || {});
    } catch (err) {
      manejarError(err, 'No se pudieron cargar las PQR.');
    }
  }, [filtrosPqr, manejarError]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const res = await API.get('/estadisticas/dashboard');
      setEstadisticas(res.data);
    } catch (err) {
      manejarError(err, 'No se pudieron cargar los indicadores del dashboard.');
    }
  }, [manejarError]);

  const cargarEstadisticasVentas = useCallback(async () => {
    try {
      const res = await API.get('/estadisticas/ventas', { params: paramsLimpiar(filtrosEstadisticas) });
      setEstadisticasVentas(res.data);
    } catch (err) {
      manejarError(err, 'No se pudieron cargar los gráficos de ventas.');
    }
  }, [filtrosEstadisticas, manejarError]);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setCargando(true);
      await Promise.all([cargarVentas(), cargarFacturas(), cargarPqr(), cargarEstadisticas(), cargarEstadisticasVentas()]);
      if (activo) setCargando(false);
    };
    cargar();
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargarVentas(); }, [cargarVentas]);
  useEffect(() => { cargarEstadisticasVentas(); }, [cargarEstadisticasVentas]);

  const recargar = useCallback(async () => {
    await Promise.all([cargarVentas(), cargarFacturas(), cargarPqr(), cargarEstadisticas(), cargarEstadisticasVentas()]);
  }, [cargarVentas, cargarFacturas, cargarPqr, cargarEstadisticas, cargarEstadisticasVentas]);

  /** Carga la lista de clientes para los filtros del admin (usa el endpoint de usuarios). */
  const cargarClientes = useCallback(async () => {
    try {
      const res = await API.get('/usuarios');
      setClientes((res.data || []).filter((usuario) => usuario.rol === 'cliente'));
    } catch {
      setClientes([]);
    }
  }, []);

  // ==========================================================
  // VENTAS
  // ==========================================================
  const registrarVenta = useCallback(async (payload) => {
    try {
      const res = await API.post('/ventas', payload);
      await recargar();
      avisar(`Venta #${res.data.id} registrada correctamente.`);
      return { ok: true, venta: res.data.venta };
    } catch (err) {
      manejarError(err, 'No se pudo registrar la venta.');
      return { ok: false };
    }
  }, [recargar, avisar, manejarError]);

  const cambiarEstadoVenta = useCallback(async (id, estado) => {
    try {
      await API.patch(`/ventas/${id}/estado`, { estado });
      setVentas((actuales) => actuales.map((venta) => (venta.id === id ? { ...venta, estado } : venta)));
      avisar('Estado de la venta actualizado.');
      cargarEstadisticas();
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo actualizar el estado de la venta.');
      return { ok: false };
    }
  }, [avisar, cargarEstadisticas, manejarError]);

  // ==========================================================
  // FACTURAS
  // ==========================================================
  const generarFactura = useCallback(async (ventaId) => {
    try {
      const res = await API.post('/facturas', { ventaId });
      await Promise.all([cargarFacturas(), cargarEstadisticas()]);
      avisar(`Factura ${res.data.factura.numero} generada correctamente.`);
      return { ok: true, factura: res.data.factura };
    } catch (err) {
      manejarError(err, 'No se pudo generar la factura.');
      return { ok: false };
    }
  }, [cargarFacturas, cargarEstadisticas, avisar, manejarError]);

  const cambiarEstadoFactura = useCallback(async (id, estado) => {
    try {
      await API.patch(`/facturas/${id}/estado`, { estado });
      setFacturas((actuales) => actuales.map((factura) => (factura.id === id ? { ...factura, estado } : factura)));
      avisar('Estado de la factura actualizado.');
      cargarVentas();
      cargarEstadisticas();
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo actualizar el estado de la factura.');
      return { ok: false };
    }
  }, [avisar, cargarVentas, cargarEstadisticas, manejarError]);

  const descargarFacturaPdf = useCallback(async (factura) => {
    try {
      const res = await API.get(`/facturas/${factura.id}/pdf`, { responseType: 'blob' });
      descargarArchivo(res, `factura-${factura.numero}.pdf`);
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo descargar la factura.');
      return { ok: false };
    }
  }, [manejarError]);

  // ==========================================================
  // REPORTES
  // ==========================================================
  const consultarReporteDiario = useCallback(async (fecha) => {
    try {
      const res = await API.get('/reportes/ventas-diario', { params: { fecha } });
      return { ok: true, reporte: res.data };
    } catch (err) {
      manejarError(err, 'No se pudo generar el reporte diario.');
      return { ok: false };
    }
  }, [manejarError]);

  const descargarReporteDiario = useCallback(async (fecha, formato) => {
    try {
      const res = await API.get(`/reportes/ventas-diario/${formato}`, { params: { fecha }, responseType: 'blob' });
      descargarArchivo(res, `reporte-ventas-${fecha}.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
      avisar(`Reporte exportado en ${formato === 'excel' ? 'Excel' : 'PDF'}.`);
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo exportar el reporte.');
      return { ok: false };
    }
  }, [avisar, manejarError]);

  // ==========================================================
  // PQR
  // ==========================================================
  const registrarPqr = useCallback(async (payload) => {
    try {
      await API.post('/pqr', payload);
      await Promise.all([cargarPqr(), cargarEstadisticas()]);
      avisar('PQR registrada correctamente. Pronto recibirás respuesta.');
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo registrar la PQR.');
      return { ok: false };
    }
  }, [cargarPqr, cargarEstadisticas, avisar, manejarError]);

  const cambiarEstadoPqr = useCallback(async (id, estado) => {
    try {
      await API.patch(`/pqr/${id}/estado`, { estado });
      await Promise.all([cargarPqr(), cargarEstadisticas()]);
      avisar('Estado de la PQR actualizado.');
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo actualizar la PQR.');
      return { ok: false };
    }
  }, [cargarPqr, cargarEstadisticas, avisar, manejarError]);

  const responderPqr = useCallback(async (id, payload) => {
    try {
      await API.post(`/pqr/${id}/respuesta`, payload);
      await Promise.all([cargarPqr(), cargarEstadisticas()]);
      avisar('Respuesta registrada correctamente.');
      return { ok: true };
    } catch (err) {
      manejarError(err, 'No se pudo registrar la respuesta.');
      return { ok: false };
    }
  }, [cargarPqr, cargarEstadisticas, avisar, manejarError]);

  return {
    ventas, facturas, pqr, resumenPqr, estadisticas, estadisticasVentas, clientes,
    filtrosVentas, filtrosFacturas, filtrosPqr, filtrosEstadisticas, cargando, error, mensaje,
    hoy: hoyISO(),
    setFiltrosVentas, setFiltrosFacturas, setFiltrosPqr, setFiltrosEstadisticas, setError, cargarClientes, recargar,
    registrarVenta, cambiarEstadoVenta,
    generarFactura, cambiarEstadoFactura, descargarFacturaPdf,
    consultarReporteDiario, descargarReporteDiario,
    registrarPqr, cambiarEstadoPqr, responderPqr,
  };
}
