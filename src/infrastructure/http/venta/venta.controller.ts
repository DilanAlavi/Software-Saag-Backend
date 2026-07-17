import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { VentaService } from '../../../application/venta/venta.service';
import { ProformaPdfService } from '../../../application/venta/proforma-pdf.service';
import { CrearVentaDto } from '../../../application/venta/dto/crear-venta.dto';
import { CotizarVentaDto } from '../../../application/venta/dto/cotizar-venta.dto';
import { PagarVentaDto } from '../../../application/venta/dto/pagar-venta.dto';
import { CancelarVentaDto } from '../../../application/venta/dto/cancelar-venta.dto';
import { EntregarVentaDto } from '../../../application/venta/dto/entregar-venta.dto';
import { ReportarVentaDto } from '../../../application/venta/dto/reportar-venta.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    private readonly proformaPdfService: ProformaPdfService,
  ) {}

  @Post('cotizar')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  cotizar(@Req() req: any, @Body() dto: CotizarVentaDto) {
    return this.ventaService.cotizar(req.user, dto);
  }

  @Post()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  crear(@Req() req: any, @Body() dto: CrearVentaDto) {
    return this.ventaService.crear(req.user, dto);
  }

  @Get()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  listar(
    @Query('estado') estado?: string,
    @Query('sucursalId') sucursalId?: string,
    @Query('fecha') fecha?: string,
    @Query('search') search?: string,
    @Query('searchTipo') searchTipo?: 'cliente' | 'vendedor',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.ventaService.listar({
      estado,
      sucursalId: sucursalId ? Number(sucursalId) : undefined,
      fecha,
      search,
      searchTipo,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  obtener(@Param('id') id: string) {
    return this.ventaService.obtener(Number(id));
  }

  @Patch(':id/pagar')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  pagar(@Param('id') id: string, @Body() dto: PagarVentaDto) {
    return this.ventaService.pagar(Number(id), dto);
  }

  @Patch(':id/cancelar')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  cancelar(@Param('id') id: string, @Body() dto: CancelarVentaDto) {
    return this.ventaService.cancelar(Number(id), dto);
  }

  @Patch(':id/entregar')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  entregar(@Param('id') id: string, @Body() dto: EntregarVentaDto) {
    return this.ventaService.entregar(Number(id), dto);
  }

  @Patch(':id/reporte')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  reportar(@Param('id') id: string, @Body() dto: ReportarVentaDto) {
    return this.ventaService.reportar(Number(id), dto);
  }

  @Get(':id/proforma')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  async proforma(@Param('id') id: string, @Res() res: any) {
    const venta = await this.ventaService.obtener(Number(id));
    const buffer = await this.proformaPdfService.generar(venta);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="proforma_${id}.pdf"`,
    });
    res.send(buffer);
  }
}
