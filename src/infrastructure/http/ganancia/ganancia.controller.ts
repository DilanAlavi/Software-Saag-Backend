import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { GananciaService } from '../../../application/ganancia/ganancia.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('ganancias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class GananciaController {
  constructor(private readonly gananciaService: GananciaService) {}

  @Get('dia')
  resumenDia(@Req() req: any, @Query('fecha') fecha?: string, @Query('sucursalId') sucursalId?: string) {
    return this.gananciaService.resumenDia(req.user, fecha, sucursalId ? Number(sucursalId) : undefined);
  }

  @Get('ultimas-ventas')
  ultimasVentas(@Req() req: any, @Query('limit') limit?: string, @Query('sucursalId') sucursalId?: string) {
    return this.gananciaService.ultimasVentas(
      req.user,
      limit ? Number(limit) : undefined,
      sucursalId ? Number(sucursalId) : undefined,
    );
  }

  @Get('historial-mensual')
  historialMensual(
    @Req() req: any,
    @Query('sucursalId') sucursalId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.gananciaService.historialMensual(req.user, sucursalId ? Number(sucursalId) : undefined, desde, hasta);
  }

  @Get('historial-anual')
  historialAnual(@Req() req: any, @Query('sucursalId') sucursalId?: string) {
    return this.gananciaService.historialAnual(req.user, sucursalId ? Number(sucursalId) : undefined);
  }
}
