import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { StockService } from '../../../application/stock/stock.service';
import { GuardarStockDto } from '../../../application/stock/dto/guardar-stock.dto';
import { ConfirmarStockDto } from '../../../application/stock/dto/confirmar-stock.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  listar() {
    return this.stockService.listar();
  }

  @Put()
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  guardar(@Body() dto: GuardarStockDto) {
    return this.stockService.guardar(dto);
  }

  @Put('confirmar')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  confirmar(@Body() dto: ConfirmarStockDto) {
    return this.stockService.confirmar(dto);
  }
}
