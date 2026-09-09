import { Link } from "react-router-dom";
import Carrusel from "../components/Carrusel";
import Features from "../components/Features";
import tractomula from "../assets/descarga.jpg";

export default function Index1() {
  return (
    <main className="bg-slate-950 text-white">

      {/* ==================== HERO ==================== */}
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden">

        {/* Fondo */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40" />

        {/* Efectos decorativos */}
        <div className="absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute -left-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-red-900/10 blur-3xl" />

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">

          {/* ==================== TEXTO ==================== */}
          <div className="max-w-2xl">

            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              INGENIERÍA PARA LA CARRETERA
            </span>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              POTENCIA
              <span className="block text-red-500">
                QUE MUEVE
              </span>
              TU CAMINO.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Tractocamiones diseñados para ofrecer rendimiento,
              tecnología y confiabilidad en cada kilómetro.
            </p>

            {/* BOTONES */}
            <div className="mt-8 flex flex-wrap gap-4">

              <Link
               to="/modelos"
                className="rounded-md bg-red-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
                >
                Ver modelos
              </Link>

              <Link
                to="/nosotros"
                className="rounded-md border border-white/20 px-7 py-3.5 font-bold text-white transition duration-300 hover:border-red-500 hover:bg-white/5"
                >
                Conócenos
              </Link>

            </div>

            {/* ==================== DATOS ==================== */}
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">

              <div>
                <p className="text-2xl font-black text-white">
                  10+
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Modelos
                </p>
              </div>

              <div>
                <p className="text-2xl font-black text-white">
                  24/7
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Rendimiento
                </p>
              </div>

              <div>
                <p className="text-2xl font-black text-white">
                  100%
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Confiabilidad
                </p>
              </div>

            </div>

          </div>

          {/* ==================== IMAGEN PRINCIPAL ==================== */}
          <div className="relative flex min-h-[400px] items-center justify-center lg:min-h-[550px]">

            {/* Resplandor */}
            <div className="absolute h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />

            {/* Contenedor */}
            <div className="relative flex h-[350px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-sm lg:h-[500px]">

              <img
                src={tractomula}
                alt="Tractocamión Road Master"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />

              {/* Degradado */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Texto sobre la imagen */}
              <div className="absolute bottom-8 left-8">

                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
                  Road Master
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  Las mejores
                </h2>

                <p className="mt-1 text-slate-300">
                  Potencia para cada recorrido.
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== CARRUSEL ==================== */}
      <section className="border-t border-white/10 bg-slate-900 px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Nuestra flota
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Conoce nuestros modelos
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Explora nuestra selección de vehículos y descubre
              las características que hacen la diferencia.
            </p>

          </div>

          <Carrusel />

        </div>

      </section>

      {/* ==================== CARACTERÍSTICAS ==================== */}
      <Features />

    </main>
  );
}