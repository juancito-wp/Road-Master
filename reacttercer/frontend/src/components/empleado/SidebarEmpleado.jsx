import { BarChart3, ClipboardList, LayoutDashboard, MessageSquare, ShoppingCart, Truck } from 'lucide-react';
import SidebarPanel from '../panel/SidebarPanel';

const items = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'dashboard', label: 'Dashboard de ventas', icon: BarChart3 },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'pqr', label: 'PQR', icon: MessageSquare },
  { id: 'solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { id: 'productos', label: 'Productos', icon: Truck },
];

export default function SidebarEmpleado({ seccionActiva, onCambiarSeccion }) {
  return (
    <SidebarPanel
      titulo="Empleado"
      items={items}
      seccionActiva={seccionActiva}
      onCambiarSeccion={onCambiarSeccion}
    />
  );
}
