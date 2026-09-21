import {
  Bot, ClipboardList, Clock, DollarSign, FileText, MessageSquare, MessagesSquare,
  Package, Percent, Receipt, ShoppingCart, TrendingUp, Truck, Users, Wrench,
} from 'lucide-react';
import TarjetaMetrica from './TarjetaMetrica';
import { formatearMoneda } from '../../utils/formato';

const ESTILOS = {
  usuarios: { icono: Users, color: 'text-white' },
  productos: { icono: Truck, color: 'text-red-400' },
  servicios: { icono: Wrench, color: 'text-blue-400' },
  ventasTotales: { icono: ShoppingCart, color: 'text-amber-400' },
  ventasMes: { icono: TrendingUp, color: 'text-amber-400' },
  ventas: { icono: ShoppingCart, color: 'text-amber-400' },
  totalVendido: { icono: DollarSign, color: 'text-green-400' },
  facturacion: { icono: Receipt, color: 'text-green-400' },
  facturas: { icono: FileText, color: 'text-cyan-400' },
  ticketPromedio: { icono: DollarSign, color: 'text-violet-400' },
  impuestos: { icono: Percent, color: 'text-slate-300' },
  unidades: { icono: Package, color: 'text-cyan-400' },
  pqrRecibidas: { icono: MessageSquare, color: 'text-violet-400' },
  pqrPendientes: { icono: Clock, color: 'text-yellow-400' },
  misPqr: { icono: MessageSquare, color: 'text-violet-400' },
  misVentas: { icono: ShoppingCart, color: 'text-amber-400' },
  miFacturacion: { icono: DollarSign, color: 'text-green-400' },
  misFacturas: { icono: Receipt, color: 'text-cyan-400' },
  conversaciones: { icono: Bot, color: 'text-blue-400' },
  mensajes: { icono: MessagesSquare, color: 'text-blue-300' },
  solicitudesPendientes: { icono: ClipboardList, color: 'text-amber-400' },
};

/** Card monetaria: mantiene el estilo de TarjetaMetrica pero sin animación de conteo. */
function TarjetaMonetaria({ etiqueta, valor, color, Icono }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-red-500/50 hover:bg-slate-800 hover:shadow-2xl hover:shadow-red-950/40">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-600/0 blur-2xl transition-all duration-500 group-hover:bg-red-600/20" />
      <div className="relative flex items-center justify-between">
        <p className="text-sm text-slate-400">{etiqueta}</p>
        {Icono && <Icono className="h-5 w-5 text-slate-500 transition-all duration-300 group-hover:scale-125 group-hover:text-red-400" />}
      </div>
      <p className={`relative mt-2 text-2xl font-black ${color}`}>{formatearMoneda(valor)}</p>
    </div>
  );
}

/** Renderiza las cards de indicadores que entrega /api/estadisticas. */
export default function TarjetasIndicadores({ cards, columnas = 'sm:grid-cols-2 lg:grid-cols-4' }) {
  if (!cards || cards.length === 0) {
    return <p className="text-sm text-slate-400">Cargando indicadores del dashboard...</p>;
  }

  return (
    <div className={`grid gap-4 ${columnas}`}>
      {cards.map((card) => {
        const estilo = ESTILOS[card.clave] || { icono: TrendingUp, color: 'text-white' };
        return card.formato === 'moneda' ? (
          <TarjetaMonetaria key={card.clave} etiqueta={card.etiqueta} valor={card.valor} color={estilo.color} Icono={estilo.icono} />
        ) : (
          <TarjetaMetrica key={card.clave} etiqueta={card.etiqueta} valor={card.valor} color={estilo.color} icono={estilo.icono} />
        );
      })}
    </div>
  );
}
