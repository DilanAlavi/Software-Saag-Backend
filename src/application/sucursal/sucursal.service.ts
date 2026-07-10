import { Inject, Injectable } from '@nestjs/common';
import { SUCURSAL_REPOSITORY, SucursalRepository } from '../../domain/sucursal/sucursal.repository';
import { CrearSucursalDto } from './dto/crear-sucursal.dto';
import { ActualizarSucursalDto } from './dto/actualizar-sucursal.dto';

@Injectable()
export class SucursalService {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepository,
  ) {}

  listar() {
    return this.sucursalRepository.findAll();
  }

  crear(dto: CrearSucursalDto) {
    return this.sucursalRepository.crear(dto);
  }

  actualizar(id: number, dto: ActualizarSucursalDto) {
    return this.sucursalRepository.actualizar(id, dto);
  }

  cambiarEstado(id: number, estado: boolean) {
    return this.sucursalRepository.cambiarEstado(id, estado);
  }
}
