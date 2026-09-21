import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { Check, Copy, QrCode, UserPlus, X } from "lucide-react";

/**
 * Widget flotante con una ventanita pequeña que muestra un código QR.
 * Al escanearlo desde el celular, la persona entra a la página desplegada
 * y se abre directamente el formulario de registro (?registro=1).
 */
export default function QrAccesoWidget() {
  const [abierto, setAbierto] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Se construye con el dominio donde esté desplegado el proyecto
  const urlRegistro = `${window.location.origin}/login?registro=1`;

  // El QR se genera en el navegador la primera vez que se abre la ventanita
  useEffect(() => {
    if (!abierto || qrDataUrl) return;

    QRCode.toDataURL(urlRegistro, {
      width: 512,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => setError("No se pudo generar el código QR."));
  }, [abierto, qrDataUrl, urlRegistro]);

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlRegistro);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* El navegador bloqueó el portapapeles */
    }
  };

  return (
    <>
      {/* ================= VENTANITA CON EL CÓDIGO QR ================= */}
      {abierto && (
        <section className="fixed bottom-56 right-6 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/60">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">Únete a Road Master</p>
              <p className="text-xs text-slate-400">Escanea y crea tu cuenta</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar código QR"
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="px-4 py-4 text-center">
            {error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Código QR para registrarse en Road Master"
                className="mx-auto w-40 rounded-xl bg-white p-2"
              />
            ) : (
              <div className="mx-auto h-40 w-40 animate-pulse rounded-xl bg-slate-800" />
            )}

            <p className="mt-3 text-xs leading-5 text-slate-400">
              Apunta la cámara de tu celular al código para entrar a la página y registrarte.
            </p>

            <div className="mt-3 flex gap-2">
              <Link
                to="/login?registro=1"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                <UserPlus className="h-4 w-4" />
                Registrarme
              </Link>
              <button
                type="button"
                onClick={copiarEnlace}
                aria-label="Copiar enlace de registro"
                title="Copiar enlace de registro"
                className="rounded-lg border border-white/10 px-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                {copiado ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= BOTÓN FLOTANTE ================= */}
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-label="Mostrar código QR de registro"
        title="Código QR para registrarse"
        className="fixed bottom-[10.5rem] right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-red-400 shadow-xl shadow-black/40 transition hover:-translate-y-1 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        {abierto ? <X className="h-6 w-6" /> : <QrCode className="h-6 w-6" />}
      </button>
    </>
  );
}
