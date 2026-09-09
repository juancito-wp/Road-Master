import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton({ telefono = "573103653154", mensaje = "Hola, necesito información sobre Road Master" }) {
  const enlace = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-950/40 transition hover:-translate-y-1 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
