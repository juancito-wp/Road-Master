export default function Index4() {
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
            Estamos para ayudarte
          </span>

          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
            CONTACTO
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            ¿Tienes preguntas sobre nuestros tractocamiones?
            Nuestro equipo está listo para ayudarte.
          </p>

        </div>

      </section>


      {/* INFORMACIÓN + FORMULARIO */}
      <section className="px-6 py-20 lg:px-8">

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">

          {/* INFORMACIÓN */}
          <div>

            <span className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              Road Master
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Hablemos de tu próximo recorrido
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-400">
              Nuestro equipo puede orientarte sobre nuestros modelos,
              características y soluciones para transporte pesado.
            </p>

            <div className="mt-10 space-y-6">

              <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-red-500">
                  📍 Ubicación
                </p>

                <p className="mt-2 text-slate-300">
                  Colombia
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-red-500">
                  📞 Teléfono
                </p>

                <p className="mt-2 text-slate-300">
                  +57 300 000 0000
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900 p-5">
                <p className="text-sm font-bold uppercase tracking-wider text-red-500">
                  ✉️ Correo
                </p>

                <p className="mt-2 text-slate-300">
                  contacto@roadmaster.com
                </p>
              </div>

            </div>

          </div>


          {/* FORMULARIO */}
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">

            <h3 className="text-2xl font-black">
              Envíanos un mensaje
            </h3>

            <p className="mt-2 text-slate-400">
              Completa el formulario y nos pondremos en contacto contigo.
            </p>

            <form className="mt-8 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Nombre
                </label>

                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Mensaje
                </label>

                <textarea
                  rows="5"
                  placeholder="Escribe tu mensaje..."
                  className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-red-600 px-6 py-3.5 font-bold text-white transition duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20"
              >
                Enviar mensaje
              </button>

            </form>

          </div>

        </div>

      </section>

    </main>
  );
}