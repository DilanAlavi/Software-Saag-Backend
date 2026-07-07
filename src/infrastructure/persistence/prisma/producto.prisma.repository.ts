import { Injectable } from '@nestjs/common';
import { ProductoRepository } from '../../../domain/producto/producto.repository';
import { Producto } from '../../../domain/producto/producto.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProductoPrismaRepository implements ProductoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Producto[]> {
    const rows = await this.prisma.producto.findMany();
    return rows.map((r) => new Producto(r.id, r.nombre, Number(r.precio), r.stock));
  }

  async findById(id: number): Promise<Producto | null> {
    const r = await this.prisma.producto.findUnique({ where: { id } });
    return r ? new Producto(r.id, r.nombre, Number(r.precio), r.stock) : null;
  }

  async create(data: { nombre: string; precio: number; stock: number }): Promise<Producto> {
    const r = await this.prisma.producto.create({ data });
    return new Producto(r.id, r.nombre, Number(r.precio), r.stock);
  }
}
