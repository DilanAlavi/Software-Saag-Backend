import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { GrupoPrecioEspecialService } from '../../../application/grupo-precio-especial/grupo-precio-especial.service';
import { CrearGrupoDto } from '../../../application/grupo-precio-especial/dto/crear-grupo.dto';
import { ActualizarGrupoDto } from '../../../application/grupo-precio-especial/dto/actualizar-grupo.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('grupos-precio-especial')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class GrupoPrecioEspecialController {
  constructor(private readonly service: GrupoPrecioEspecialService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Post()
  crear(@Body() dto: CrearGrupoDto) {
    return this.service.crear(dto);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarGrupoDto) {
    return this.service.actualizar(Number(id), dto);
  }

  @Post(':id/productos/:productoId')
  agregarProducto(@Param('id') id: string, @Param('productoId') productoId: string) {
    return this.service.agregarProducto(Number(id), Number(productoId));
  }

  @Delete(':id/productos/:productoId')
  quitarProducto(@Param('id') id: string, @Param('productoId') productoId: string) {
    return this.service.quitarProducto(Number(id), Number(productoId));
  }

  @Post(':id/clientes/:clienteId')
  agregarCliente(@Param('id') id: string, @Param('clienteId') clienteId: string) {
    return this.service.agregarCliente(Number(id), Number(clienteId));
  }

  @Delete(':id/clientes/:clienteId')
  quitarCliente(@Param('id') id: string, @Param('clienteId') clienteId: string) {
    return this.service.quitarCliente(Number(id), Number(clienteId));
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: boolean) {
    return this.service.cambiarEstado(Number(id), estado);
  }
}
