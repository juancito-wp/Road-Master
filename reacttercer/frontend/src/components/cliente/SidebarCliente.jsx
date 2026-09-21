import { ClipboardList, LayoutDashboard, MessageSquare, Receipt, ShoppingCart, Users } from 'lucide-react';
import SidebarPanel from '../panel/SidebarPanel';

const items = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'compra', label: 'Comprar', icon: ShoppingCart },
  { id: 'facturas', label: 'Mis facturas', icon: Receipt },
  { id: 'pqr', label: 'Mis PQR', icon: MessageSquare },
  { id: 'cotizacion', label: 'Cotización', icon: ClipboardList },
  { id: 'perfil', label: 'Mi perfil', icon: Users },
];

export default function SidebarCliente({ seccionActiva, onCambiarSeccion }) {
  return (
    <SidebarPanel
      titulo="Mi Cuenta"
      items={items}
      seccionActiva={seccionActiva}
      onCambiarSeccion={onCambiarSeccion}
    />
  );
}
