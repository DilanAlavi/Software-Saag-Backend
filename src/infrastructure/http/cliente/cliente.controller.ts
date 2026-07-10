import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClienteService } from '../../../application/cliente/cliente.service';
import { CrearClienteDto } from '../../../application/cliente/dto/crear-cliente.dto';
import { ActualizarClienteDto } from '../../../application/cliente/dto/actualizar-cliente.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  listar(@Query('search') search?: string, @Query('rol') rol?: string) {
    return this.clienteService.listar({ search, rol });
  }

  @Get(':id')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  obtener(@Param('id') id: string) {
    return this.clienteService.obtener(Number(id));
  }

  @Post()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  crear(@Body() dto: CrearClienteDto) {
    return this.clienteService.crear(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarClienteDto) {
    return this.clienteService.actualizar(Number(id), dto);
  }

  @Patch(':id/estado')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  cambiarEstado(@Req() req: any, @Param('id') id: string, @Body('estado') estado: boolean) {
    return this.clienteService.cambiarEstado(Number(id), estado, req.user.sub);
  }

  @Get(':id/historial')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  historial(@Param('id') id: string) {
    return this.clienteService.historial(Number(id));
  }
}
