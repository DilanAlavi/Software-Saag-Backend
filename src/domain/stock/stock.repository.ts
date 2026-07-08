import { Stock } from './stock.entity';

export const STOCK_REPOSITORY = 'STOCK_REPOSITORY';

export interface GuardarStockInput {
  area?: string;
  cantidad?: number;
}

export interface StockConDetalle {
  id: number;
  productoId: number;
  productoNombre: string;
  productoCodigo: string | null;
  sucursalId: number;
  sucursalNombre: string;
  sucursalTipo: string;
  area: string | null;
  cantidad: number | null;
}

export interface StockRepository {
  listarConDetalle(): Promise<StockConDetalle[]>;
  guardar(productoId: number, sucursalId: number, data: GuardarStockInput): Promise<Stock>;
}
