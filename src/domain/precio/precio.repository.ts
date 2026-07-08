import { Precio } from './precio.entity';

export const PRECIO_REPOSITORY = 'PRECIO_REPOSITORY';

export interface GuardarPrecioInput {
  precioCosto: number;
  menor1: number;
  menor2: number;
  mayor1: number;
  mayor2: number;
  plomeria: number;
  carpinteria: number;
  electricista: number;
  precioCaja?: number;
  cantidadMinimaDescuentoMenor1?: number;
  precioDescuentoMenor1?: number;
}

export interface ProductoConPrecio {
  productoId: number;
  nombre: string;
  tipoProducto: string;
  precio: Precio | null;
}

export interface PrecioRepository {
  listarConProducto(): Promise<ProductoConPrecio[]>;
  findByProductoId(productoId: number): Promise<Precio | null>;
  guardar(productoId: number, data: GuardarPrecioInput): Promise<Precio>;
}
