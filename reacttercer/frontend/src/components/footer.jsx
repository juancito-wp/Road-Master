import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import logoRoadMaster from "../assets/logo road master.png";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-3">

          {/* LOGO Y DESCRIPCIÓN */}
          <div>
            <img
              src={logoRoadMaster}
              alt="Road Master"
              className="mb-5 h-16 w-auto object-contain"
            />

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Road Master, soluciones y productos para el mundo del
              transporte pesado y las tractomulas.
            </p>
          </div>

          {/* ENLACES */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Enlaces
            </h3>

            <div className="flex flex-col gap-3 text-sm text-slate-400">

              <a
                href="/"
                className="transition hover:text-red-500"
              >
                Inicio
              </a>

              <a
                href="/nosotros"
                className="transition hover:text-red-500"
              >
                Nosotros
              </a>

              <a
                href="/modelos"
                className="transition hover:text-red-500"
              >
                Productos
              </a>

              <a
                href="/contacto"
                className="transition hover:text-red-500"
              >
                Contacto
              </a>

            </div>
          </div>

          {/* REDES SOCIALES */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Síguenos
            </h3>

            <p className="mb-5 text-sm text-slate-400">
              Conoce más sobre Road Master a través de nuestras redes.
            </p>

            <div className="flex gap-3">

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/j.mx_00?igsh=MW1uOHdxbWRpNWxnbg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:bg-red-600 hover:text-white"
              >
                <FaInstagram size={21} />
              </a>

              {/* FACEBOOK */}
              <a
                href="https://www.facebook.com/share/14mpkN3d4Lr/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:bg-red-600 hover:text-white"
              >
                <FaFacebookF size={19} />
              </a>

              {/* WHATSAPP */}
              <a
                href="https://wa.me/3103653154"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:bg-red-600 hover:text-white"
              >
                <FaWhatsapp size={21} />
              </a>

            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 Road Master. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}