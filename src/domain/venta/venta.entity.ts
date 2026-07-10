export type EstadoVenta = 'PENDIENTE' | 'PAGADO' | 'CANCELADO';
export type MotivoCancelacion = 'NO_RECOGIO' | 'CLIENTE_CANCELO';

export interface DetalleVentaConDetalle {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  entregado: boolean;
}

export interface VentaConDetalle {
  id: number;
  cliente: { id: number; nombre: string; apellidoPaterno: string; celular: string };
  usuario: { id: number; nombre: string; apellidoPaterno: string };
  sucursal: { id: number; nombre: string };
  estado: EstadoVenta;
  motivoCancelacion: MotivoCancelacion | null;
  fecha: Date;
  total: number;
  efectivoRecibido: number | null;
  vuelto: number | null;
  fechaPago: Date | null;
  reporte: string | null;
  fechaReporte: Date | null;
  detalles: DetalleVentaConDetalle[];
}
