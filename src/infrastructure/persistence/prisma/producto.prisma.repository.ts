import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
      p.unidadesPorPaquete,
      p.unidadesPorCaja,
      p.ventaSoloPorPaquete,
      p.unidadVenta,
      p.unidadVentaTamano,
    );
  }

  async findAll(filtros: ProductoFiltros): Promise<Producto[]> {
    // Sin búsqueda de texto: consulta normal de Prisma.
    if (!filtros.search) {
      const where: any = { estado: true };
      if (filtros.tipoProducto) {
        where.tipoProducto = filtros.tipoProducto;
      }
      const rows = await this.prisma.producto.findMany({ where, orderBy: { nombre: 'asc' } });
      return rows.map((p) => this.toEntity(p));
    }

    // Con búsqueda: se separa en palabras sueltas. Un producto aparece si TODAS las palabras
    // están en algún lado (nombre, marca, código o nombres alternativos), sin importar el orden,
    // mayúsculas/minúsculas ni tildes, y sin exigir que estén pegadas (ej. "cinta 15" encuentra
    // "Cinta de goteo 15 cm", y "compresion" sin tilde encuentra "compresión").
    const palabras = filtros.search.trim().split(/\s+/).filter(Boolean);
    const condicionesPorPalabra = palabras.map((palabra) => {
      const comodin = `%${palabra}%`;
      return Prisma.sql`(
        unaccent("nombre") ILIKE unaccent(${comodin}) OR
        unaccent("marca") ILIKE unaccent(${comodin}) OR
        "codigo" ILIKE ${comodin} OR
        EXISTS (SELECT 1 FROM unnest("nombresAlternativos") AS alt WHERE unaccent(alt) ILIKE unaccent(${comodin}))
      )`;
    });

    const condicionTipo = filtros.tipoProducto
      ? Prisma.sql`AND "tipoProducto" = ${filtros.tipoProducto}::"TipoProducto"`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "Producto"
      WHERE "estado" = true
      ${condicionTipo}
      AND ${Prisma.join(condicionesPorPalabra, ' AND ')}
      ORDER BY "nombre" ASC
    `;
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
          unidadesPorPaquete: data.unidadesPorPaquete,
          unidadesPorCaja: data.unidadesPorCaja,
          ventaSoloPorPaquete: data.ventaSoloPorPaquete ?? false,
          unidadVenta: data.unidadVenta,
          unidadVentaTamano: data.unidadVentaTamano,
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
        unidadesPorPaquete: data.unidadesPorPaquete,
        unidadesPorCaja: data.unidadesPorCaja,
        ventaSoloPorPaquete: data.ventaSoloPorPaquete,
        unidadVenta: data.unidadVenta,
        unidadVentaTamano: data.unidadVentaTamano,
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
