import { Injectable } from '@nestjs/common';
import { GuardarStockInput, StockConDetalle, StockRepository } from '../../../domain/stock/stock.repository';
import { calcularDesglose } from '../../../domain/stock/empaquetado';
import { Stock } from '../../../domain/stock/stock.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class StockPrismaRepository implements StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): Stock {
    return new Stock(
      r.id,
      r.productoId,
      r.sucursalId,
      r.area,
      r.cantidad,
      r.confirmado,
      r.cantidadVendidaAcumulada,
      r.fechaActualizacion,
    );
  }

  async listarConDetalle(): Promise<StockConDetalle[]> {
    const rows = await this.prisma.stock.findMany({
      include: { producto: true, sucursal: true },
      orderBy: [{ producto: { nombre: 'asc' } }],
    });

    return rows.map((r) => {
      const desglose = calcularDesglose(r.cantidad, r.producto.unidadesPorCaja, r.producto.unidadesPorPaquete);
      return {
        id: r.id,
        productoId: r.productoId,
        productoNombre: r.producto.nombre,
        productoCodigo: r.producto.codigo,
        unidadesPorCaja: r.producto.unidadesPorCaja,
        unidadesPorPaquete: r.producto.unidadesPorPaquete,
        ventaSoloPorPaquete: r.producto.ventaSoloPorPaquete,
        sucursalId: r.sucursalId,
        sucursalNombre: r.sucursal.nombre,
        sucursalTipo: r.sucursal.tipo,
        area: r.area,
        unidadesTotales: r.cantidad,
        confirmado: r.confirmado,
        cantidadVendidaAcumulada: r.cantidadVendidaAcumulada,
        ...desglose,
      };
    });
  }

  async guardar(productoId: number, sucursalId: number, data: GuardarStockInput): Promise<Stock> {
    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUniqueOrThrow({ where: { id: productoId } });
      const unidadesPorCaja = producto.unidadesPorCaja ?? 0;

      const unidadesAgregadas = (data.cajas ?? 0) * unidadesPorCaja + (data.piezas ?? 0);

      const existente = await tx.stock.findUnique({
        where: { productoId_sucursalId: { productoId, sucursalId } },
      });

      const cantidadAnterior = existente?.cantidad ?? 0;
      const cantidadNueva = cantidadAnterior + unidadesAgregadas;

      const r = await tx.stock.upsert({
        where: { productoId_sucursalId: { productoId, sucursalId } },
        create: { productoId, sucursalId, area: data.area, cantidad: cantidadNueva },
        update: {
          area: data.area !== undefined ? data.area : existente?.area,
          cantidad: cantidadNueva,
        },
      });

      return this.toEntity(r);
    });
  }

  async confirmar(productoId: number, sucursalId: number, cantidad: number): Promise<Stock> {
    const r = await this.prisma.stock.upsert({
      where: { productoId_sucursalId: { productoId, sucursalId } },
      create: { productoId, sucursalId, cantidad, confirmado: true },
      update: { cantidad, confirmado: true },
    });
    return this.toEntity(r);
  }

  async registrarVenta(productoId: number, sucursalId: number, cantidadVendida: number): Promise<void> {
    const existente = await this.prisma.stock.findUnique({
      where: { productoId_sucursalId: { productoId, sucursalId } },
    });

    if (!existente) {
      await this.prisma.stock.create({
        data: {
          productoId,
          sucursalId,
          cantidadVendidaAcumulada: cantidadVendida,
        },
      });
      return;
    }

    await this.prisma.stock.update({
      where: { productoId_sucursalId: { productoId, sucursalId } },
      data: {
        cantidadVendidaAcumulada: existente.cantidadVendidaAcumulada + cantidadVendida,
        cantidad: existente.confirmado ? (existente.cantidad ?? 0) - cantidadVendida : existente.cantidad,
      },
    });
  }
}
