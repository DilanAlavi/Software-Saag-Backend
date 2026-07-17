import { Injectable } from '@nestjs/common';
import { GananciaFiltros, GananciaRepository, RangoMensualFiltros } from '../../../domain/ganancia/ganancia.repository';
import {
  GananciaAnual,
  GananciaMensual,
  HistorialGanancias,
  HistorialGananciasAnual,
  ResumenGananciasDia,
  VentaConGanancia,
} from '../../../domain/ganancia/ganancia.entity';
import { PrismaService } from './prisma.service';

const includeParaGanancia = {
  cliente: true,
  usuario: true,
  sucursal: true,
  detalles: { include: { producto: { include: { precio: true } } } },
};

function mesKey(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}`;
}

function rangoMeses(desde: string, hasta: string): string[] {
  const [anioDesde, mesDesde] = desde.split('-').map(Number);
  const [anioHasta, mesHasta] = hasta.split('-').map(Number);
  const claves: string[] = [];
  let anio = anioDesde;
  let mes = mesDesde;
  while (anio < anioHasta || (anio === anioHasta && mes <= mesHasta)) {
    claves.push(`${anio}-${String(mes).padStart(2, '0')}`);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      anio += 1;
    }
  }
  return claves;
}

@Injectable()
export class GananciaPrismaRepository implements GananciaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toVentaConGanancia(v: any): VentaConGanancia {
    const detalles = v.detalles.map((d: any) => {
      const precioCosto = d.producto?.precio ? Number(d.producto.precio.precioCosto) : 0;
      // Cuando el producto se vende solo por paquete, "precioCosto" es el costo del PAQUETE
      // completo (ej. la caja de 24), no el de una pieza suelta — hay que dividirlo entre las
      // unidades del paquete para tener el costo real por pieza antes de multiplicar por la
      // cantidad vendida (que siempre viene en piezas sueltas reales).
      const costoUnitario =
        d.producto?.ventaSoloPorPaquete && d.producto?.unidadesPorPaquete
          ? precioCosto / d.producto.unidadesPorPaquete
          : precioCosto;
      const total = Number(d.total);
      const ganancia = total - costoUnitario * d.cantidad;
      return {
        id: d.id,
        productoId: d.productoId,
        nombreProducto: d.nombreProducto,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precioUnitario),
        total,
        costoUnitario,
        ganancia,
      };
    });

    return {
      id: v.id,
      fecha: v.fecha,
      cliente: { id: v.cliente.id, nombre: v.cliente.nombre, apellidoPaterno: v.cliente.apellidoPaterno },
      usuario: { id: v.usuario.id, nombre: v.usuario.nombre, apellidoPaterno: v.usuario.apellidoPaterno },
      sucursal: { id: v.sucursal.id, nombre: v.sucursal.nombre },
      total: Number(v.total),
      gananciaTotal: detalles.reduce((acc: number, d: any) => acc + d.ganancia, 0),
      detalles,
    };
  }

  private whereBase(filtros: GananciaFiltros) {
    const where: any = { estado: 'PAGADO' };
    if (filtros.sucursalId) {
      where.sucursalId = filtros.sucursalId;
    }
    return where;
  }

  async resumenDia(fecha: string, filtros: GananciaFiltros): Promise<ResumenGananciasDia> {
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59.999`);

    const ventas = await this.prisma.venta.findMany({
      where: { ...this.whereBase(filtros), fecha: { gte: inicio, lte: fin } },
      include: includeParaGanancia,
    });

    const convertidas = ventas.map((v) => this.toVentaConGanancia(v));
    return {
      fecha,
      cantidadVentas: convertidas.length,
      cantidadProductosVendidos: convertidas.reduce(
        (acc, v) => acc + v.detalles.reduce((a, d) => a + d.cantidad, 0),
        0,
      ),
      ingresoTotal: convertidas.reduce((acc, v) => acc + v.total, 0),
      gananciaTotal: convertidas.reduce((acc, v) => acc + v.gananciaTotal, 0),
      ventas: convertidas,
    };
  }

  async ultimasVentas(limit: number, filtros: GananciaFiltros): Promise<VentaConGanancia[]> {
    const ventas = await this.prisma.venta.findMany({
      where: this.whereBase(filtros),
      include: includeParaGanancia,
      orderBy: { fecha: 'desc' },
      take: limit,
    });
    return ventas.map((v) => this.toVentaConGanancia(v));
  }

  async historialMensual(filtros: RangoMensualFiltros): Promise<HistorialGanancias> {
    const [anioDesde, mesDesde] = filtros.desde.split('-').map(Number);
    const [anioHasta, mesHasta] = filtros.hasta.split('-').map(Number);
    const inicio = new Date(anioDesde, mesDesde - 1, 1, 0, 0, 0, 0);
    const fin = new Date(anioHasta, mesHasta, 0, 23, 59, 59, 999);

    const ventas = await this.prisma.venta.findMany({
      where: { ...this.whereBase(filtros), fecha: { gte: inicio, lte: fin } },
      include: includeParaGanancia,
    });

    const convertidas = ventas.map((v) => this.toVentaConGanancia(v));
    const porMes = new Map<string, GananciaMensual>();
    for (const key of rangoMeses(filtros.desde, filtros.hasta)) {
      porMes.set(key, { mes: key, cantidadVentas: 0, ingresoTotal: 0, gananciaTotal: 0 });
    }

    for (const venta of convertidas) {
      const key = mesKey(venta.fecha);
      const actual = porMes.get(key) ?? { mes: key, cantidadVentas: 0, ingresoTotal: 0, gananciaTotal: 0 };
      actual.cantidadVentas += 1;
      actual.ingresoTotal += venta.total;
      actual.gananciaTotal += venta.gananciaTotal;
      porMes.set(key, actual);
    }

    const meses = Array.from(porMes.values()).sort((a, b) => (a.mes < b.mes ? 1 : -1));

    const totalGeneral = meses.reduce(
      (acc, m) => ({
        cantidadVentas: acc.cantidadVentas + m.cantidadVentas,
        ingresoTotal: acc.ingresoTotal + m.ingresoTotal,
        gananciaTotal: acc.gananciaTotal + m.gananciaTotal,
      }),
      { cantidadVentas: 0, ingresoTotal: 0, gananciaTotal: 0 },
    );

    return { meses, totalGeneral };
  }

  async historialAnual(filtros: GananciaFiltros): Promise<HistorialGananciasAnual> {
    const ventas = await this.prisma.venta.findMany({
      where: this.whereBase(filtros),
      include: includeParaGanancia,
    });

    const convertidas = ventas.map((v) => this.toVentaConGanancia(v));
    const porAnio = new Map<string, GananciaAnual>();

    for (const venta of convertidas) {
      const key = String(venta.fecha.getFullYear());
      const actual = porAnio.get(key) ?? { anio: key, cantidadVentas: 0, ingresoTotal: 0, gananciaTotal: 0 };
      actual.cantidadVentas += 1;
      actual.ingresoTotal += venta.total;
      actual.gananciaTotal += venta.gananciaTotal;
      porAnio.set(key, actual);
    }

    const anios = Array.from(porAnio.values()).sort((a, b) => (a.anio < b.anio ? 1 : -1));

    const totalGeneral = anios.reduce(
      (acc, a) => ({
        cantidadVentas: acc.cantidadVentas + a.cantidadVentas,
        ingresoTotal: acc.ingresoTotal + a.ingresoTotal,
        gananciaTotal: acc.gananciaTotal + a.gananciaTotal,
      }),
      { cantidadVentas: 0, ingresoTotal: 0, gananciaTotal: 0 },
    );

    return { anios, totalGeneral };
  }
}
