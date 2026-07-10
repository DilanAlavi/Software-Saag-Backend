import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SucursalService } from '../../../application/sucursal/sucursal.service';
import { CrearSucursalDto } from '../../../application/sucursal/dto/crear-sucursal.dto';
import { ActualizarSucursalDto } from '../../../application/sucursal/dto/actualizar-sucursal.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('sucursales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Get()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  listar() {
    return this.sucursalService.listar();
  }

  @Post()
  @Roles('ADMIN')
  crear(@Body() dto: CrearSucursalDto) {
    return this.sucursalService.crear(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarSucursalDto) {
    return this.sucursalService.actualizar(Number(id), dto);
  }

  @Patch(':id/estado')
  @Roles('ADMIN')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: boolean) {
    return this.sucursalService.cambiarEstado(Number(id), estado);
  }
}
