import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsuarioService } from '../../../application/usuario/usuario.service';
import { CrearUsuarioDto } from '../../../application/usuario/dto/crear-usuario.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  listar(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('sucursalId') sucursalId?: string,
  ) {
    return this.usuarioService.listar(req.user, {
      search,
      sucursalId: sucursalId ? Number(sucursalId) : undefined,
    });
  }

  @Post()
  crear(@Req() req: any, @Body() dto: CrearUsuarioDto) {
    return this.usuarioService.crear(req.user, dto);
  }

  @Patch(':id/estado')
  cambiarEstado(@Req() req: any, @Param('id') id: string, @Body('estado') estado: boolean) {
    return this.usuarioService.cambiarEstado(req.user, Number(id), estado);
  }

  @Get(':id/historial')
  historial(@Param('id') id: string) {
    return this.usuarioService.historial(Number(id));
  }
}
