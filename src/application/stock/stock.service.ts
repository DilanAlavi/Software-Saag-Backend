import { Inject, Injectable } from '@nestjs/common';
import { STOCK_REPOSITORY, StockRepository } from '../../domain/stock/stock.repository';
import { GuardarStockDto } from './dto/guardar-stock.dto';
import { ConfirmarStockDto } from './dto/confirmar-stock.dto';

@Injectable()
export class StockService {
  constructor(
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepository,
  ) {}

  listar() {
    return this.stockRepository.listarConDetalle();
  }

  guardar(dto: GuardarStockDto) {
    return this.stockRepository.guardar(dto.productoId, dto.sucursalId, {
      area: dto.area,
      cajas: dto.cajas,
      piezas: dto.piezas,
    });
  }

  confirmar(dto: ConfirmarStockDto) {
    return this.stockRepository.confirmar(dto.productoId, dto.sucursalId, dto.cantidad);
  }
}
