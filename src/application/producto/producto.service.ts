import { Inject, Injectable } from '@nestjs/common';
import { PRODUCTO_REPOSITORY, ProductoRepository } from '../../domain/producto/producto.repository';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: ProductoRepository,
  ) {}

  listar() {
    return this.productoRepository.findAll();
  }

  obtener(id: number) {
    return this.productoRepository.findById(id);
  }

  crear(dto: CreateProductoDto) {
    return this.productoRepository.create(dto);
  }
}
