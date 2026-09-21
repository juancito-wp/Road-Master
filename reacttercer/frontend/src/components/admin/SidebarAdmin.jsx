import { BarChart3, FileSpreadsheet, LayoutDashboard, MessageSquare, Receipt, ShoppingCart, Truck, Users, Wrench } from 'lucide-react';
import SidebarPanel from '../panel/SidebarPanel';

const items = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'dashboard', label: 'Dashboard de ventas', icon: BarChart3 },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'facturas', label: 'Facturación', icon: Receipt },
  { id: 'reportes', label: 'Reportes', icon: FileSpreadsheet },
  { id: 'pqr', label: 'PQR', icon: MessageSquare },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'productos', label: 'Productos', icon: Truck },
  { id: 'servicios', label: 'Servicios', icon: Wrench },
];

export default function SidebarAdmin({ seccionActiva, onCambiarSeccion }) {
  return (
    <SidebarPanel
      titulo="Administración"
      items={items}
      seccionActiva={seccionActiva}
      onCambiarSeccion={onCambiarSeccion}
    />
  );
}
