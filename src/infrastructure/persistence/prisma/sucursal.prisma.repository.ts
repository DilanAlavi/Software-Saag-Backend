import { Injectable } from '@nestjs/common';
import { SucursalRepository } from '../../../domain/sucursal/sucursal.repository';
import { Sucursal } from '../../../domain/sucursal/sucursal.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class SucursalPrismaRepository implements SucursalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Sucursal[]> {
    const rows = await this.prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return rows.map((s) => new Sucursal(s.id, s.nombre, s.tipo, s.estado));
  }
}
