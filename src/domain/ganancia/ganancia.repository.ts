import {
  GananciaMensual,
  HistorialGanancias,
  HistorialGananciasAnual,
  ResumenGananciasDia,
  VentaConGanancia,
} from './ganancia.entity';

export const GANANCIA_REPOSITORY = 'GANANCIA_REPOSITORY';

export interface GananciaFiltros {
  sucursalId?: number;
}

export interface RangoMensualFiltros extends GananciaFiltros {
  desde: string; // 'YYYY-MM'
  hasta: string; // 'YYYY-MM'
}

export interface GananciaRepository {
  resumenDia(fecha: string, filtros: GananciaFiltros): Promise<ResumenGananciasDia>;
  ultimasVentas(limit: number, filtros: GananciaFiltros): Promise<VentaConGanancia[]>;
  historialMensual(filtros: RangoMensualFiltros): Promise<HistorialGanancias>;
  historialAnual(filtros: GananciaFiltros): Promise<HistorialGananciasAnual>;
}

export { GananciaMensual, HistorialGanancias, HistorialGananciasAnual, ResumenGananciasDia, VentaConGanancia };
