import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PrecioService } from '../../../application/precio/precio.service';
import { GuardarPrecioDto } from '../../../application/precio/dto/guardar-precio.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('precios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class PrecioController {
  constructor(private readonly precioService: PrecioService) {}

  @Get()
  listar() {
    return this.precioService.listar();
  }

  @Put(':productoId')
  guardar(@Param('productoId') productoId: string, @Body() dto: GuardarPrecioDto) {
    return this.precioService.guardar(Number(productoId), dto);
  }
}
