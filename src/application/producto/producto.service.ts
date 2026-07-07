import { Inject, Injectable } from '@nestjs/common';
import { PRODUCTO_REPOSITORY, ProductoFiltros, ProductoRepository } from '../../domain/producto/producto.repository';
import { CrearProductoDto } from './dto/crear-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: ProductoRepository,
  ) {}

  listar(filtros: ProductoFiltros) {
    return this.productoRepository.findAll(filtros);
  }

  crear(realizadoPorId: number, dto: CrearProductoDto) {
    return this.productoRepository.crearConHistorial(dto, realizadoPorId);
  }

  eliminar(realizadoPorId: number, id: number) {
    return this.productoRepository.eliminarConHistorial(id, realizadoPorId);
  }

  historial(id: number) {
    return this.productoRepository.historial(id);
  }
}
