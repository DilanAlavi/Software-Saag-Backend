import { Injectable } from '@nestjs/common';
import { GuardarStockInput, StockConDetalle, StockRepository } from '../../../domain/stock/stock.repository';
import { Stock } from '../../../domain/stock/stock.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class StockPrismaRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarConDetalle(): Promise<StockConDetalle[]> {
    const rows = await this.prisma.stock.findMany({
      include: { producto: true, sucursal: true },
      orderBy: [{ producto: { nombre: 'asc' } }],
    });

    return rows.map((r) => ({
      id: r.id,
      productoId: r.productoId,
      productoNombre: r.producto.nombre,
      productoCodigo: r.producto.codigo,
      sucursalId: r.sucursalId,
      sucursalNombre: r.sucursal.nombre,
      sucursalTipo: r.sucursal.tipo,
      area: r.area,
      cantidad: r.cantidad,
    }));
  }

  async guardar(productoId: number, sucursalId: number, data: GuardarStockInput): Promise<Stock> {
    const r = await this.prisma.stock.upsert({
      where: { productoId_sucursalId: { productoId, sucursalId } },
      create: { productoId, sucursalId, area: data.area, cantidad: data.cantidad },
      update: { area: data.area, cantidad: data.cantidad },
    });
    return new Stock(r.id, r.productoId, r.sucursalId, r.area, r.cantidad, r.fechaActualizacion);
  }
}
