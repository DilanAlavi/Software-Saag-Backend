import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProductoService } from '../../../application/producto/producto.service';
import { CrearProductoDto } from '../../../application/producto/dto/crear-producto.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  listar(@Query('search') search?: string, @Query('tipoProducto') tipoProducto?: string) {
    return this.productoService.listar({ search, tipoProducto });
  }

  @Post()
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  crear(@Req() req: any, @Body() dto: CrearProductoDto) {
    return this.productoService.crear(req.user.sub, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  eliminar(@Req() req: any, @Param('id') id: string) {
    return this.productoService.eliminar(req.user.sub, Number(id));
  }

  @Get(':id/historial')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  historial(@Param('id') id: string) {
    return this.productoService.historial(Number(id));
  }
}
