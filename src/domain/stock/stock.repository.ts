import { Stock } from './stock.entity';

export const STOCK_REPOSITORY = 'STOCK_REPOSITORY';

export interface GuardarStockInput {
  area?: string;
  cajas?: number;
  piezas?: number;
}

export interface StockConDetalle {
  id: number;
  productoId: number;
  productoNombre: string;
  productoCodigo: string | null;
  unidadesPorCaja: number | null;
  unidadesPorPaquete: number | null;
  ventaSoloPorPaquete: boolean;
  sucursalId: number;
  sucursalNombre: string;
  sucursalTipo: string;
  area: string | null;
  unidadesTotales: number | null;
  cajas: number | null;
  paquetes: number | null;
  piezasSueltas: number | null;
  confirmado: boolean;
  cantidadVendidaAcumulada: number;
}

export interface StockRepository {
  listarConDetalle(): Promise<StockConDetalle[]>;
  guardar(productoId: number, sucursalId: number, data: GuardarStockInput): Promise<Stock>;
  confirmar(productoId: number, sucursalId: number, cantidad: number): Promise<Stock>;
  registrarVenta(productoId: number, sucursalId: number, cantidadVendida: number): Promise<void>;
}
