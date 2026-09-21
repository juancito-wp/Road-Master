import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // 👈 Importamos la instancia de Axios

import descarga from "../assets/descarga.jpg";
import cuatroManos from "../assets/4 manos.jpg";
import ranchera from "../assets/international ranchera.jpg";
import eagle from "../assets/international Eagle 9400i.jpg";
import international4700 from "../assets/international 4700.jpg";
import gmc from "../assets/gmc.jpg";

const modelosLocales = [
  {
    imagen: descarga,
    nombre: "Road Master 01",
    descripcion:
      "Tractocamión diseñado para ofrecer potencia, rendimiento y confiabilidad en largas jornadas.",
    potencia: "500 HP",
    motor: "13 L",
    transmision: "Automática",
    aplicacion: "Larga distancia",
  },
  {
    imagen: cuatroManos,
    nombre: "Road Master 02",
    descripcion:
      "Una solución de transporte pensada para enfrentar grandes recorridos y diferentes condiciones de carretera.",
    potencia: "550 HP",
    motor: "15 L",
    transmision: "Manual de 18 velocidades",
    aplicacion: "Carga pesada",
  },
  {
    imagen: ranchera,
    nombre: "Road Master 03",
    descripcion:
      "Diseño y tecnología orientados a conseguir un excelente desempeño en el transporte pesado.",
    potencia: "480 HP",
    motor: "12.7 L",
    transmision: "Manual de 18 velocidades",
    aplicacion: "Transporte nacional",
  },
  {
    imagen: eagle,
    nombre: "Road Master 04",
    descripcion:
      "Un modelo preparado para ofrecer estabilidad, resistencia y eficiencia durante el trabajo.",
    potencia: "520 HP",
    motor: "13 L",
    transmision: "Manual de 18 velocidades",
    aplicacion: "Operación regional",
  },
  {
    imagen: international4700,
    nombre: "Road Master 05",
    descripcion:
      "Potencia y confiabilidad para operaciones de transporte que requieren un alto desempeño.",
    potencia: "600 HP",
    motor: "15 L",
    transmision: "Manual de 13 velocidades",
    aplicacion: "Carga pesada",
  },
  {
    imagen: gmc,
    nombre: "Road Master 06",
    descripcion:
      "Una propuesta enfocada en rendimiento, comodidad y tecnología para largas distancias.",
    potencia: "530 HP",
    motor: "13 L",
    transmision: "Manual de 18 velocidades",
    aplicacion: "Larga distancia",
  },
];

export default function Index3() {
  const [modelos, setModelos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerModelos = async () => {
      try {
        setCargando(true);
        // Petición GET al servidor backend protegido
        const respuesta = await API.get("/modelos");

        if (respuesta.data && respuesta.data.length > 0) {
          setModelos(respuesta.data);
        } else {
          // Si el backend responde array vacío, muestra la lista base con imágenes
          setModelos(modelosLocales);
        }
      } catch (err) {
        console.warn(
          "No se pudieron obtener datos del backend, usando datos estáticos.",
          err
        );
        // En caso de fallo en la API, mantiene la interfaz funcional usando la lista local
        setModelos(modelosLocales);
        setError("Mostrando catálogo en modo local.");
      } finally {
        setCargando(false);
      }
    };

    obtenerModelos();
  }, []);

  const abrirModelo = (modelo) => setModeloSeleccionado(modelo);
  const cerrarModelo = () => setModeloSeleccionado(null);

  // Solo un usuario con sesión de cliente puede enviar una cotización
  const haySesionCliente = () => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rolUsuario");
    return Boolean(token) && rol === "cliente";
  };

  // Lleva a la cotización del panel de cliente con el vehículo ya elegido.
  // Sin sesión de cliente, primero pasa por el Login y luego regresa a la cotización.
  const cotizarModelo = (modelo) => {
    const intencion = {
      seccion: "cotizacion",
      modeloId: modelo?.id ?? null,
      modeloNombre: modelo?.nombre ?? null,
    };

    if (haySesionCliente()) {
      navigate("/mi-cuenta", { state: intencion });
    } else {
      navigate("/login", { state: { ...intencion, redirectTo: "/mi-cuenta" } });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {modeloSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-red-950/30">
            <button
              type="button"
              onClick={cerrarModelo}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-800/80 px-3 py-1 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2">
              <div className="h-full min-h-[260px]">
                <img
                  src={modeloSeleccionado.imagen || descarga}
                  alt={modeloSeleccionado.nombre}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = descarga;
                  }}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-8">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                  Road Master
                </span>
                <h3 className="mt-4 text-3xl font-black text-white">
                  {modeloSeleccionado.nombre}
                </h3>

                <p className="mt-4 text-base leading-7 text-slate-300">
                  {modeloSeleccionado.descripcion ||
                    'Este modelo está diseñado para ofrecer un rendimiento confiable, eficiencia operativa y resistencia en trayectos exigentes.'}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Potencia</p>
                    <p className="mt-1 font-bold text-white">{modeloSeleccionado.potencia || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Motor</p>
                    <p className="mt-1 font-bold text-white">{modeloSeleccionado.motor || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Transmisión</p>
                    <p className="mt-1 font-bold text-white">{modeloSeleccionado.transmision || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Aplicación</p>
                    <p className="mt-1 font-bold text-white">{modeloSeleccionado.aplicacion || '—'}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => cotizarModelo(modeloSeleccionado)}
                    className="inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
                  >
                    Cotizar este modelo
                  </button>

                  <button
                    type="button"
                    onClick={cerrarModelo}
                    className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/40 hover:text-white"
                  >
                    Cerrar
                  </button>
                </div>

                {!haySesionCliente() && (
                  <p className="mt-3 text-xs text-slate-500">
                    Para enviar la cotización necesitas iniciar sesión o crear una cuenta como cliente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Nuestra flota
          </span>

          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            MODELOS
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Descubre nuestra selección de tractocamiones diseñados para responder
            a las exigencias del transporte profesional.
          </p>
        </div>
      </section>

      {/* ================= MODELOS ================= */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* TÍTULO */}
          <div className="mb-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Explora nuestra gama
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Potencia para cada recorrido
            </h2>

            <p className="mt-4 max-w-2xl text-slate-400">
              Conoce las diferentes opciones de nuestra flota y encuentra el
              vehículo adecuado para tus necesidades de transporte.
            </p>

            {error && (
              <p className="mt-2 text-xs font-semibold text-amber-500">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* ESTADO DE CARGA */}
          {cargando ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-lg font-semibold animate-pulse">
                Cargando flota desde la base de datos...
              </p>
            </div>
          ) : (
            /* ================= TARJETAS ================= */
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {modelos.map((modelo, idx) => (
                <article
                  key={modelo.id || modelo.nombre || idx}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-950/30"
                >
                  {/* IMAGEN */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={modelo.imagen || descarga}
                      alt={modelo.nombre}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = descarga;
                      }}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <span className="absolute left-5 top-5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg">
                      Road Master
                    </span>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="p-6">
                    <h3 className="text-2xl font-black">{modelo.nombre}</h3>

                    <p className="mt-3 leading-7 text-slate-400">
                      {modelo.descripcion}
                    </p>

                    {/* ================= ESPECIFICACIONES ================= */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {/* Potencia */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Potencia
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {modelo.potencia}
                        </p>
                      </div>

                      {/* Motor */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Motor
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {modelo.motor}
                        </p>
                      </div>

                      {/* Transmisión */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Transmisión
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {modelo.transmision}
                        </p>
                      </div>

                      {/* Aplicación */}
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Aplicación
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {modelo.aplicacion}
                        </p>
                      </div>
                    </div>

                    {/* BOTÓN */}
                    <button
                      type="button"
                      onClick={() => abrirModelo(modelo)}
                      className="mt-6 inline-flex items-center gap-2 font-bold text-red-500 transition-all duration-300 hover:gap-4 hover:text-red-400"
                    >
                      Ver modelo
                      <span className="text-xl">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="border-t border-white/10 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            ¿Necesitas asesoría?
          </span>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Encuentra el modelo adecuado para tu operación
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Nuestro equipo está preparado para ayudarte a encontrar una solución
            que se adapte a tus necesidades de transporte.
          </p>

          <button
            type="button"
            onClick={() => navigate("/contacto")}
            className="mt-8 rounded-md bg-red-600 px-8 py-4 font-bold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
          >
            Contactar
          </button>
        </div>
      </section>
    </main>
  );
}