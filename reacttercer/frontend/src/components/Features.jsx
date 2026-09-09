const features = [
  {
    icon: "⚙️",
    title: "Potencia",
    description:
      "Motores preparados para responder ante las exigencias del transporte pesado y las largas jornadas de trabajo.",
  },
  {
    icon: "🛣️",
    title: "Rendimiento",
    description:
      "Tecnología enfocada en ofrecer eficiencia, estabilidad y un excelente desempeño en carretera.",
  },
  {
    icon: "🛡️",
    title: "Confiabilidad",
    description:
      "Vehículos diseñados para acompañarte en cada recorrido con seguridad y resistencia.",
  },
];

export default function Features() {
  return (
    <section className="border-t border-white/10 bg-slate-950 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mx-auto max-w-2xl text-center">

          <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Nuestro compromiso
          </span>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Diseñados para ir más lejos
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            Cada vehículo combina ingeniería, tecnología y resistencia
            para ofrecer soluciones confiables para el transporte.
          </p>

        </div>

        {/* TARJETAS */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">

          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-slate-900 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-950/20"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-600/10 text-3xl transition duration-300 group-hover:bg-red-600 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {feature.description}
              </p>

              <div className="mt-6 h-1 w-10 rounded-full bg-red-600 transition-all duration-300 group-hover:w-20" />

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}