import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENTE_REPOSITORY, ClienteFiltros, ClienteRepository } from '../../domain/cliente/cliente.repository';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  listar(filtros: ClienteFiltros) {
    return this.clienteRepository.findAll(filtros);
  }

  async obtener(id: number) {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  crear(dto: CrearClienteDto) {
    return this.clienteRepository.crear(dto);
  }

  actualizar(id: number, dto: ActualizarClienteDto) {
    return this.clienteRepository.actualizar(id, dto);
  }

  cambiarEstado(id: number, estadoNuevo: boolean, realizadoPorId: number) {
    return this.clienteRepository.updateEstadoConHistorial(id, estadoNuevo, realizadoPorId);
  }

  historial(id: number) {
    return this.clienteRepository.historial(id);
  }
}
