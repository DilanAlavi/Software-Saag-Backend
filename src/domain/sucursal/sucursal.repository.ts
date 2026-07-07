import { Sucursal } from './sucursal.entity';

export const SUCURSAL_REPOSITORY = 'SUCURSAL_REPOSITORY';

export interface SucursalRepository {
  findAll(): Promise<Sucursal[]>;
}
