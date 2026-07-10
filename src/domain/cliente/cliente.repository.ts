import { Cliente } from './cliente.entity';
import { HistorialEstado } from '../usuario/usuario.repository';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

export interface ClienteFiltros {
  search?: string;
  rol?: string;
}

export interface CrearClienteInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  ci?: string;
  celular: string;
  genero?: string;
  rol: string;
}

export interface ActualizarClienteInput {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  ci?: string;
  celular?: string;
  genero?: string;
  rol?: string;
}

export interface ClienteRepository {
  findById(id: number): Promise<Cliente | null>;
  findAll(filtros: ClienteFiltros): Promise<Cliente[]>;
  crear(data: CrearClienteInput): Promise<Cliente>;
  actualizar(id: number, data: ActualizarClienteInput): Promise<Cliente>;
  updateEstadoConHistorial(id: number, estadoNuevo: boolean, realizadoPorId: number): Promise<Cliente>;
  historial(clienteId: number): Promise<HistorialEstado[]>;
}
