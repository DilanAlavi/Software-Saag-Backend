import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ClienteService } from '../../../application/cliente/cliente.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  listar(@Query('search') search?: string, @Query('rol') rol?: string) {
    return this.clienteService.listar({ search, rol });
  }

  @Patch(':id/estado')
  cambiarEstado(@Req() req: any, @Param('id') id: string, @Body('estado') estado: boolean) {
    return this.clienteService.cambiarEstado(Number(id), estado, req.user.sub);
  }

  @Get(':id/historial')
  historial(@Param('id') id: string) {
    return this.clienteService.historial(Number(id));
  }
}
