import { Injectable } from '@nestjs/common';
import {
  ActualizarProductoInput,
  CrearProductoInput,
  HistorialProductoRegistro,
  ProductoFiltros,
  ProductoRepository,
} from '../../../domain/producto/producto.repository';
import { Producto } from '../../../domain/producto/producto.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProductoPrismaRepository implements ProductoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(p: any): Producto {
    return new Producto(
      p.id,
      p.nombre,
      p.nombresAlternativos,
      p.marca,
      p.tipoProducto,
      p.codigo,
      p.estado,
      p.fechaRegistro,
    );
  }

  async findAll(filtros: ProductoFiltros): Promise<Producto[]> {
    const where: any = { estado: true };
    if (filtros.tipoProducto) {
      where.tipoProducto = filtros.tipoProducto;
    }
    if (filtros.search) {
      where.OR = [
        { nombre: { contains: filtros.search, mode: 'insensitive' } },
        { marca: { contains: filtros.search, mode: 'insensitive' } },
        { codigo: { contains: filtros.search, mode: 'insensitive' } },
        { nombresAlternativos: { has: filtros.search } },
      ];
    }

    const rows = await this.prisma.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
    return rows.map((p) => this.toEntity(p));
  }

  async findById(id: number): Promise<Producto | null> {
    const p = await this.prisma.producto.findUnique({ where: { id } });
    return p ? this.toEntity(p) : null;
  }

  async crearConHistorial(data: CrearProductoInput, realizadoPorId: number): Promise<Producto> {
    return this.prisma.$transaction(async (tx) => {
      const creado = await tx.producto.create({
        data: {
          nombre: data.nombre,
          nombresAlternativos: data.nombresAlternativos ?? [],
          marca: data.marca,
          tipoProducto: data.tipoProducto as any,
          codigo: data.codigo,
        },
      });
      await tx.historialProducto.create({
        data: {
          productoId: creado.id,
          accion: 'CREACION',
          realizadoPorId,
        },
      });
      return this.toEntity(creado);
    });
  }

  async actualizar(id: number, data: ActualizarProductoInput): Promise<Producto> {
    const actualizado = await this.prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        nombresAlternativos: data.nombresAlternativos,
        marca: data.marca,
        tipoProducto: data.tipoProducto as any,
        codigo: data.codigo,
      },
    });
    return this.toEntity(actualizado);
  }

  async eliminarConHistorial(id: number, realizadoPorId: number): Promise<Producto> {
    return this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.producto.update({ where: { id }, data: { estado: false } });
      await tx.historialProducto.create({
        data: {
          productoId: id,
          accion: 'ELIMINACION',
          realizadoPorId,
        },
      });
      return this.toEntity(actualizado);
    });
  }

  async historial(productoId: number): Promise<HistorialProductoRegistro[]> {
    return this.prisma.historialProducto.findMany({
      where: { productoId },
      orderBy: { fecha: 'desc' },
    });
  }

  async marcasDistintas(): Promise<string[]> {
    const rows = await this.prisma.producto.findMany({
      where: { estado: true, marca: { not: null } },
      distinct: ['marca'],
      select: { marca: true },
      orderBy: { marca: 'asc' },
    });
    return rows.map((r) => r.marca).filter((m): m is string => Boolean(m));
  }
}
