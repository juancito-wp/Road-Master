import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import API from '../../api/axios';

const PREGUNTAS = [
  '¿Qué modelos tienen disponibles?',
  '¿Cómo registro una PQR?',
  '¿Qué servicios de taller ofrecen?',
  '¿Cómo puedo comprar o cotizar?',
];

const MENSAJE_INICIAL = {
  rol: 'assistant',
  contenido: '¡Hola! Soy el asistente virtual de Road Master 🏍️. Te ayudo con productos, servicios, cotizaciones y PQR. ¿En qué te puedo ayudar?',
};

const leerGuardado = (clave, respaldo) => {
  try {
    return JSON.parse(localStorage.getItem(clave) || JSON.stringify(respaldo));
  } catch {
    return respaldo;
  }
};

/** Chatbot de atención al cliente integrado al sitio web y conectado al backend con IA. */
export default function ChatbotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState(() => leerGuardado('chatMensajes', [MENSAJE_INICIAL]));
  const [texto, setTexto] = useState('');
  const [sesion, setSesion] = useState(() => localStorage.getItem('chatSesion') || '');
  const [fuente, setFuente] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const finRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatMensajes', JSON.stringify(mensajes.slice(-30)));
  }, [mensajes]);

  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [abierto, mensajes, enviando]);

  const enviar = async (contenido) => {
    const mensaje = (contenido ?? texto).trim();
    if (!mensaje || enviando) return;

    setTexto('');
    setError('');
    setMensajes((actuales) => [...actuales, { rol: 'user', contenido: mensaje }]);
    setEnviando(true);

    try {
      const res = await API.post('/chatbot/mensaje', {
        mensaje,
        sesion: sesion || undefined,
        historial: mensajes.slice(-8).map(({ rol, contenido: cuerpo }) => ({ rol, contenido: cuerpo })),
      });
      setSesion(res.data.sesion);
      localStorage.setItem('chatSesion', res.data.sesion);
      setFuente(res.data.fuente);
      setMensajes((actuales) => [...actuales, { rol: 'assistant', contenido: res.data.respuesta }]);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo contactar al asistente. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {abierto && (
        <section className="fixed bottom-24 right-6 z-50 flex h-[30rem] w-[min(23rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/60">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/20 text-red-400">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Asistente Road Master</p>
                <p className="text-xs text-slate-400">
                  {fuente === 'openai' ? 'Conectado a IA (OpenAI)' : 'Atención inmediata 24/7'}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat" className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {mensajes.map((mensaje, indice) => (
              <div key={indice} className={`flex ${mensaje.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                  mensaje.rol === 'user'
                    ? 'rounded-br-sm bg-red-600 text-white'
                    : 'rounded-bl-sm border border-white/10 bg-slate-800 text-slate-200'
                }`}>
                  {mensaje.contenido}
                </p>
              </div>
            ))}

            {enviando && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 animate-pulse text-red-400" /> El asistente está escribiendo...
              </div>
            )}
            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">{error}</p>}
            <div ref={finRef} />
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {PREGUNTAS.map((pregunta) => (
                <button key={pregunta} type="button" onClick={() => enviar(pregunta)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-red-500/40 hover:text-white">
                  {pregunta}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="flex items-center gap-2">
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe tu pregunta..."
                maxLength={500}
                className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
              />
              <button type="submit" disabled={enviando} className="rounded-xl bg-red-600 p-2.5 text-white transition hover:bg-red-700 disabled:opacity-60" aria-label="Enviar mensaje">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-label="Abrir chat de atención"
        title="Chat de atención al cliente"
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-950/40 transition hover:-translate-y-1 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        {abierto ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
