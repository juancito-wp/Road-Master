export default function Index2() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">

        {/* Fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30" />

        {/* Efecto rojo */}
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">

          <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            ROAD MASTER
          </span>

          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
            NOSOTROS
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Conoce quiénes somos, nuestra visión y el compromiso
            que tenemos con el transporte profesional.
          </p>

        </div>

      </section>


      {/* QUIÉNES SOMOS */}
      <section className="px-6 py-20 lg:px-8">

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">

          {/* TEXTO */}
          <div>

            <span className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Nuestra empresa
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Diseñados para mover el mundo
            </h2>

            <p className="mt-6 leading-8 text-slate-400">
              En Road Master trabajamos para ofrecer soluciones de
              transporte diseñadas para responder a las exigencias
              de las carreteras y del transporte profesional.
            </p>

            <p className="mt-4 leading-8 text-slate-400">
              Nuestra propuesta combina potencia, tecnología,
              rendimiento y confiabilidad para acompañar a los
              conductores y empresas en cada recorrido.
            </p>

          </div>


          {/* TARJETA */}
          <div className="relative">

            <div className="absolute -inset-4 rounded-3xl bg-red-600/10 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-sm">

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-red-600 text-3xl shadow-lg shadow-red-600/20">
                🚛
              </div>

              <h3 className="text-2xl font-black">
                Road Master
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Potencia y tecnología pensadas para afrontar cada
                kilómetro con seguridad, eficiencia y confianza.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* VALORES */}
      <section className="border-t border-white/10 bg-slate-900 px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Lo que nos representa
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Nuestros valores
            </h2>

          </div>


          <div className="grid gap-8 md:grid-cols-3">

            <article className="rounded-2xl border border-white/10 bg-slate-950 p-8 transition duration-300 hover:-translate-y-2 hover:border-red-500/40">

              <div className="mb-5 text-4xl">
                ⚡
              </div>

              <h3 className="text-xl font-black">
                Potencia
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Vehículos preparados para afrontar grandes
                exigencias y largas jornadas de trabajo.
              </p>

            </article>


            <article className="rounded-2xl border border-white/10 bg-slate-950 p-8 transition duration-300 hover:-translate-y-2 hover:border-red-500/40">

              <div className="mb-5 text-4xl">
                ⚙️
              </div>

              <h3 className="text-xl font-black">
                Tecnología
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Soluciones modernas pensadas para mejorar el
                rendimiento y la experiencia en carretera.
              </p>

            </article>


            <article className="rounded-2xl border border-white/10 bg-slate-950 p-8 transition duration-300 hover:-translate-y-2 hover:border-red-500/40">

              <div className="mb-5 text-4xl">
                🛡️
              </div>

              <h3 className="text-xl font-black">
                Confiabilidad
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Comprometidos con ofrecer vehículos resistentes
                y preparados para cada recorrido.
              </p>

            </article>

          </div>

        </div>

      </section>

    </main>
  );
}