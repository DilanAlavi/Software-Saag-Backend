import { Marca } from './marca.entity';

export const MARCA_REPOSITORY = 'MARCA_REPOSITORY';

export interface MarcaRepository {
  findAll(): Promise<Marca[]>;
  create(nombre: string): Promise<Marca>;
  eliminar(id: number): Promise<Marca>;
}
