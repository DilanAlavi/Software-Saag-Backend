export interface DetalleVentaConGanancia {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  costoUnitario: number;
  ganancia: number;
}

export interface VentaConGanancia {
  id: number;
  fecha: Date;
  cliente: { id: number; nombre: string; apellidoPaterno: string };
  usuario: { id: number; nombre: string; apellidoPaterno: string };
  sucursal: { id: number; nombre: string };
  total: number;
  gananciaTotal: number;
  detalles: DetalleVentaConGanancia[];
}

export interface ResumenGananciasDia {
  fecha: string;
  cantidadVentas: number;
  cantidadProductosVendidos: number;
  ingresoTotal: number;
  gananciaTotal: number;
  ventas: VentaConGanancia[];
}

export interface GananciaMensual {
  mes: string; // 'YYYY-MM'
  cantidadVentas: number;
  ingresoTotal: number;
  gananciaTotal: number;
}

export interface HistorialGanancias {
  meses: GananciaMensual[];
  totalGeneral: { cantidadVentas: number; ingresoTotal: number; gananciaTotal: number };
}

export interface GananciaAnual {
  anio: string; // 'YYYY'
  cantidadVentas: number;
  ingresoTotal: number;
  gananciaTotal: number;
}

export interface HistorialGananciasAnual {
  anios: GananciaAnual[];
  totalGeneral: { cantidadVentas: number; ingresoTotal: number; gananciaTotal: number };
}
