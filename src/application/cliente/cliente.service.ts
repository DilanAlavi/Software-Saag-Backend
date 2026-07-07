import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY, ClienteFiltros, ClienteRepository } from '../../domain/cliente/cliente.repository';

@Injectable()
export class ClienteService {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  listar(filtros: ClienteFiltros) {
    return this.clienteRepository.findAll(filtros);
  }

  cambiarEstado(id: number, estadoNuevo: boolean, realizadoPorId: number) {
    return this.clienteRepository.updateEstadoConHistorial(id, estadoNuevo, realizadoPorId);
  }

  historial(id: number) {
    return this.clienteRepository.historial(id);
  }
}
