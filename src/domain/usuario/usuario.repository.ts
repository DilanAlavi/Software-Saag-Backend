import { Usuario } from './usuario.entity';

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';

export interface UsuarioFiltros {
  search?: string;
  sucursalId?: number;
}

export interface CrearUsuarioInput {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  ci?: string;
  celular: string;
  genero?: string;
  username: string;
  password: string;
  rol: string;
  sucursalId?: number;
}

export interface HistorialEstado {
  id: number;
  estadoAnterior: boolean;
  estadoNuevo: boolean;
  fecha: Date;
  realizadoPorId: number;
}

export interface UsuarioRepository {
  findByUsername(username: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
  findAll(filtros: UsuarioFiltros): Promise<Usuario[]>;
  create(data: CrearUsuarioInput): Promise<Usuario>;
  updateEstadoConHistorial(id: number, estadoNuevo: boolean, realizadoPorId: number): Promise<Usuario>;
  historial(usuarioId: number): Promise<HistorialEstado[]>;
}