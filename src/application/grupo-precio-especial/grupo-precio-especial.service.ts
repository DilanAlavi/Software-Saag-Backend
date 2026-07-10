import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  GRUPO_PRECIO_ESPECIAL_REPOSITORY,
  GrupoPrecioEspecialRepository,
} from '../../domain/grupo-precio-especial/grupo-precio-especial.repository';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';

@Injectable()
export class GrupoPrecioEspecialService {
  constructor(
    @Inject(GRUPO_PRECIO_ESPECIAL_REPOSITORY)
    private readonly repository: GrupoPrecioEspecialRepository,
  ) {}

  listar() {
    return this.repository.listar();
  }

  crear(dto: CrearGrupoDto) {
    return this.repository.crear(dto);
  }

  actualizar(grupoId: number, dto: ActualizarGrupoDto) {
    return this.repository.actualizar(grupoId, dto);
  }

  async agregarProducto(grupoId: number, productoId: number) {
    try {
      return await this.repository.agregarProducto(grupoId, productoId);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Ese producto ya está en este grupo');
      }
      throw e;
    }
  }

  quitarProducto(grupoId: number, productoId: number) {
    return this.repository.quitarProducto(grupoId, productoId);
  }

  async agregarCliente(grupoId: number, clienteId: number) {
    try {
      return await this.repository.agregarCliente(grupoId, clienteId);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Ese cliente ya está en este grupo');
      }
      throw e;
    }
  }

  quitarCliente(grupoId: number, clienteId: number) {
    return this.repository.quitarCliente(grupoId, clienteId);
  }

  cambiarEstado(grupoId: number, estado: boolean) {
    return this.repository.cambiarEstado(grupoId, estado);
  }
}
