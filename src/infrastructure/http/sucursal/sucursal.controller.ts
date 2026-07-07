import { Controller, Get, UseGuards } from '@nestjs/common';
import { SucursalService } from '../../../application/sucursal/sucursal.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('sucursales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Get()
  listar() {
    return this.sucursalService.listar();
  }
}
