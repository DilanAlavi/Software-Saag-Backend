import { Producto } from './producto.entity';
import { HistorialEstado } from '../usuario/usuario.repository';

export const PRODUCTO_REPOSITORY = 'PRODUCTO_REPOSITORY';

export interface ProductoFiltros {
  search?: string;
  tipoProducto?: string;
}

export interface CrearProductoInput {
  nombre: string;
  nombresAlternativos?: string[];
  marca?: string;
  tipoProducto: string;
  codigo?: string;
  cantidad?: number;
  precioCosto?: number;
}

export interface HistorialProductoRegistro {
  id: number;
  accion: 'CREACION' | 'ELIMINACION';
  fecha: Date;
  realizadoPorId: number;
}

export interface ProductoRepository {
  findAll(filtros: ProductoFiltros): Promise<Producto[]>;
  findById(id: number): Promise<Producto | null>;
  crearConHistorial(data: CrearProductoInput, realizadoPorId: number): Promise<Producto>;
  eliminarConHistorial(id: number, realizadoPorId: number): Promise<Producto>;
  historial(productoId: number): Promise<HistorialProductoRegistro[]>;
}
