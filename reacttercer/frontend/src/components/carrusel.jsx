import { useEffect, useState } from "react";

import cuatroManos from "../assets/4 manos.jpg";
import internationalRanchera from "../assets/international ranchera.jpg";
import internationalEagle from "../assets/international Eagle 9400i.jpg";
import international4700 from "../assets/international 4700.jpg";
import kenworthK100 from "../assets/kenworth k100.jpg";
import gmc from "../assets/gmc.jpg";
import lonestar from "../assets/lonestar.jpg";
import fotonAuman from "../assets/foton auman.jpg";
import fordLtl9000 from "../assets/Ford LTL 9000.jpg";
import daf from "../assets/daf.jpg";

export default function Carrusel() {
  const modelos = [
    {
      imagen: cuatroManos,
      titulo: "4 Manos",
      descripcion:
        "Vehículo diseñado para ofrecer rendimiento y confiabilidad en carretera.",
    },
    {
      imagen: internationalRanchera,
      titulo: "International Ranchera",
      descripcion:
        "Una combinación de potencia, tecnología y eficiencia para largas jornadas.",
    },
    {
      imagen: internationalEagle,
      titulo: "International Eagle 9400i",
      descripcion:
        "Diseñado para enfrentar diferentes condiciones de transporte y carretera.",
    },
    {
      imagen: international4700,
      titulo: "International 4700",
      descripcion:
        "Rendimiento y comodidad pensados para el trabajo diario.",
    },
    {
      imagen: kenworthK100,
      titulo: "Kenworth K100",
      descripcion:
        "Tecnología y resistencia para acompañarte en cada recorrido.",
    },
    {
      imagen: gmc,
      titulo: "GMC",
      descripcion:
        "Una solución preparada para grandes recorridos y cargas exigentes.",
    },
    {
      imagen: lonestar,
      titulo: "Lonestar",
      descripcion:
        "Diseño robusto y rendimiento confiable para el transporte pesado.",
    },
    {
      imagen: fotonAuman,
      titulo: "Foton Auman",
      descripcion:
        "Confiabilidad para recorrer largas distancias con seguridad.",
    },
    {
      imagen: fordLtl9000,
      titulo: "Ford LTL 9000",
      descripcion:
        "Diseño clásico y prestaciones pensadas para el transporte profesional.",
    },
    {
      imagen: daf,
      titulo: "DAF",
      descripcion:
        "Una propuesta de alto rendimiento para las necesidades del transporte.",
    },
  ];

  const [indice, setIndice] = useState(0);

  // ==============================
  // SIGUIENTE IMAGEN
  // ==============================

  const siguiente = () => {
    setIndice((prev) => (prev + 1) % modelos.length);
  };

  // ==============================
  // IMAGEN ANTERIOR
  // ==============================

  const anterior = () => {
    setIndice((prev) => (prev - 1 + modelos.length) % modelos.length);
  };

  // ==============================
  // CAMBIO AUTOMÁTICO
  // ==============================

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % modelos.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [modelos.length]);

  const modeloActual = modelos[indice];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

      {/* ==============================
          CARRUSEL
      ============================== */}

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

        {/* ==============================
            IMAGEN
        ============================== */}

        <div className="group relative h-[300px] overflow-hidden sm:h-[400px] md:h-[500px]">

          <img
            key={modeloActual.imagen}
            src={modeloActual.imagen}
            alt={modeloActual.titulo}
            className="h-full w-full object-contain transition-all duration-700 group-hover:scale-105"
          />

          {/* OSCURECER IMAGEN */}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* NÚMERO */}

          <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur-md">
            {String(indice + 1).padStart(2, "0")} /{" "}
            {String(modelos.length).padStart(2, "0")}
          </div>

          {/* ==============================
              BOTÓN ANTERIOR
          ============================== */}

          <button
            onClick={anterior}
            aria-label="Imagen anterior"
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-2xl text-white backdrop-blur-md transition duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-600"
          >
            ←
          </button>

          {/* ==============================
              BOTÓN SIGUIENTE
          ============================== */}

          <button
            onClick={siguiente}
            aria-label="Imagen siguiente"
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-2xl text-white backdrop-blur-md transition duration-300 hover:scale-110 hover:border-red-500 hover:bg-red-600"
          >
            →
          </button>

          {/* ==============================
              INFORMACIÓN
          ============================== */}

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">

            <span className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
              Road Master
            </span>

            <h3 className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              {modeloActual.titulo}
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {modeloActual.descripcion}
            </p>

          </div>

        </div>

        {/* ==============================
            INDICADORES
        ============================== */}

        <div className="flex justify-center gap-2 bg-slate-950 px-4 py-5">

          {modelos.map((modelo, i) => (
            <button
              key={modelo.titulo}
              onClick={() => setIndice(i)}
              aria-label={`Ver ${modelo.titulo}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === indice
                  ? "w-8 bg-red-500"
                  : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}

        </div>

      </div>

      {/* ==============================
          CONTROLES INFERIORES
      ============================== */}

      <div className="mt-6 flex items-center justify-center gap-4">

        <button
          onClick={anterior}
          className="rounded-lg border border-white/10 bg-slate-900 px-5 py-3 font-semibold text-white transition duration-300 hover:border-red-500 hover:bg-red-600"
        >
          ← Anterior
        </button>

        <button
          onClick={siguiente}
          className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:bg-red-700"
        >
          Siguiente →
        </button>

      </div>

    </div>
  );
}