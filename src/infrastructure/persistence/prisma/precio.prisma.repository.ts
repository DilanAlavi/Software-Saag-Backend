import { Injectable } from '@nestjs/common';
import {
  GuardarPrecioInput,
  PrecioRepository,
  ProductoConPrecio,
} from '../../../domain/precio/precio.repository';
import { Precio } from '../../../domain/precio/precio.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrecioPrismaRepository implements PrecioRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(p: any): Precio {
    return new Precio(
      p.id,
      p.productoId,
      Number(p.precioCosto),
      Number(p.menor1),
      Number(p.menor2),
      Number(p.mayor1),
      Number(p.mayor2),
      Number(p.plomeria),
      Number(p.carpinteria),
      Number(p.electricista),
      p.precioCaja !== null && p.precioCaja !== undefined ? Number(p.precioCaja) : null,
      p.precioPiezaSuelta !== null && p.precioPiezaSuelta !== undefined ? Number(p.precioPiezaSuelta) : null,
      p.cantidadMinimaDescuentoMenor1 ?? null,
      p.precioDescuentoMenor1 !== null && p.precioDescuentoMenor1 !== undefined ? Number(p.precioDescuentoMenor1) : null,
      p.fechaActualizacion,
    );
  }

  async listarConProducto(): Promise<ProductoConPrecio[]> {
    const productos = await this.prisma.producto.findMany({
      where: { estado: true },
      include: { precio: true },
      orderBy: { nombre: 'asc' },
    });

    return productos.map((p) => ({
      productoId: p.id,
      nombre: p.nombre,
      tipoProducto: p.tipoProducto,
      precio: p.precio ? this.toEntity(p.precio) : null,
    }));
  }

  async findByProductoId(productoId: number): Promise<Precio | null> {
    const p = await this.prisma.precio.findUnique({ where: { productoId } });
    return p ? this.toEntity(p) : null;
  }

  async guardar(productoId: number, data: GuardarPrecioInput): Promise<Precio> {
    const p = await this.prisma.precio.upsert({
      where: { productoId },
      create: { productoId, ...data },
      update: { ...data },
    });
    return this.toEntity(p);
  }
}
