import { Injectable } from '@nestjs/common';
import { MarcaRepository } from '../../../domain/marca/marca.repository';
import { Marca } from '../../../domain/marca/marca.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class MarcaPrismaRepository implements MarcaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(m: any): Marca {
    return new Marca(m.id, m.nombre, m.estado, m.fechaRegistro);
  }

  async findAll(): Promise<Marca[]> {
    const rows = await this.prisma.marca.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
    });
    return rows.map((m) => this.toEntity(m));
  }

  async create(nombre: string): Promise<Marca> {
    const m = await this.prisma.marca.create({ data: { nombre } });
    return this.toEntity(m);
  }

  async eliminar(id: number): Promise<Marca> {
    const m = await this.prisma.marca.update({ where: { id }, data: { estado: false } });
    return this.toEntity(m);
  }
}
