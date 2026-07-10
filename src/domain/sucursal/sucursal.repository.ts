import { Sucursal } from './sucursal.entity';

export const SUCURSAL_REPOSITORY = 'SUCURSAL_REPOSITORY';

export interface CrearSucursalInput {
  nombre: string;
  tipo: string;
  departamento?: string;
  ciudad?: string;
  zona?: string;
  referencia?: string;
  modalidadVentaPaquete?: string;
}

export interface ActualizarSucursalInput {
  nombre?: string;
  tipo?: string;
  departamento?: string;
  ciudad?: string;
  zona?: string;
  referencia?: string;
  modalidadVentaPaquete?: string | null;
}

export interface SucursalRepository {
  findAll(): Promise<Sucursal[]>;
  crear(data: CrearSucursalInput): Promise<Sucursal>;
  actualizar(id: number, data: ActualizarSucursalInput): Promise<Sucursal>;
  cambiarEstado(id: number, estado: boolean): Promise<Sucursal>;
}
