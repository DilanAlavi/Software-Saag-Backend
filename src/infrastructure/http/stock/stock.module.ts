import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from '../../../application/stock/stock.service';
import { StockPrismaRepository } from '../../persistence/prisma/stock.prisma.repository';
import { STOCK_REPOSITORY } from '../../../domain/stock/stock.repository';

@Module({
  controllers: [StockController],
  providers: [
    StockService,
    { provide: STOCK_REPOSITORY, useClass: StockPrismaRepository },
  ],
})
export class StockModule {}
