import { Inject, Injectable } from '@nestjs/common';
import { SUCURSAL_REPOSITORY, SucursalRepository } from '../../domain/sucursal/sucursal.repository';

@Injectable()
export class SucursalService {
  constructor(
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepository,
  ) {}

  listar() {
    return this.sucursalRepository.findAll();
  }
}
