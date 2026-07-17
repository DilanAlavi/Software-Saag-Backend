import { VentaConDetalle } from './venta.entity';

export const VENTA_REPOSITORY = 'VENTA_REPOSITORY';

export interface LineaVentaInput {
  productoId: number;
  cantidad: number;
}

export interface CrearVentaInput {
  clienteId: number;
  usuarioId: number;
  sucursalId: number;
  lineas: LineaVentaInput[];
  pagarAhora: boolean;
  efectivoRecibido?: number;
}

export interface CotizarVentaInput {
  clienteId: number;
  sucursalId: number;
  lineas: LineaVentaInput[];
}

export interface LineaCotizada {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

export interface VentaCotizada {
  lineas: LineaCotizada[];
  total: number;
}

export interface VentaFiltros {
  estado?: string;
  sucursalId?: number;
  fecha?: string; // YYYY-MM-DD, filtra a ese día exacto
  search?: string; // busca por nombre del cliente o del vendedor, según searchTipo
  searchTipo?: 'cliente' | 'vendedor';
  page?: number;
  pageSize?: number;
}

export interface VentaListado {
  ventas: VentaConDetalle[];
  total: number;
}

export interface VentaRepository {
  crear(input: CrearVentaInput): Promise<VentaConDetalle>;
  cotizar(input: CotizarVentaInput): Promise<VentaCotizada>;
  listar(filtros: VentaFiltros): Promise<VentaListado>;
  obtener(id: number): Promise<VentaConDetalle | null>;
  pagar(id: number, efectivoRecibido: number): Promise<VentaConDetalle>;
  cancelar(id: number, motivo: string): Promise<VentaConDetalle>;
  entregar(id: number, detalleIds: number[]): Promise<VentaConDetalle>;
  reportar(id: number, mensaje: string): Promise<VentaConDetalle>;
}
