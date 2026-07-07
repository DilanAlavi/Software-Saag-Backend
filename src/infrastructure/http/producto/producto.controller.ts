import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductoService } from '../../../application/producto/producto.service';
import { CreateProductoDto } from '../../../application/producto/dto/create-producto.dto';

@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  listar() {
    return this.productoService.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.productoService.obtener(Number(id));
  }

  @Post()
  crear(@Body() dto: CreateProductoDto) {
    return this.productoService.crear(dto);
  }
}
