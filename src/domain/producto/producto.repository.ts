import { Producto } from './producto.entity';

export const PRODUCTO_REPOSITORY = 'PRODUCTO_REPOSITORY';

export interface ProductoRepository {
  findAll(): Promise<Producto[]>;
  findById(id: number): Promise<Producto | null>;
  create(data: { nombre: string; precio: number; stock: number }): Promise<Producto>;
}
