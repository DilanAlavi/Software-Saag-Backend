import { Inject, Injectable } from '@nestjs/common';
import { MARCA_REPOSITORY, MarcaRepository } from '../../domain/marca/marca.repository';

@Injectable()
export class MarcaService {
  constructor(
    @Inject(MARCA_REPOSITORY)
    private readonly marcaRepository: MarcaRepository,
  ) {}

  listar() {
    return this.marcaRepository.findAll();
  }

  crear(nombre: string) {
    return this.marcaRepository.create(nombre);
  }

  eliminar(id: number) {
    return this.marcaRepository.eliminar(id);
  }
}
