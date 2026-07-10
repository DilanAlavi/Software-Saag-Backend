import { Injectable } from '@nestjs/common';
import {
  ActualizarSucursalInput,
  CrearSucursalInput,
  SucursalRepository,
} from '../../../domain/sucursal/sucursal.repository';
import { Sucursal } from '../../../domain/sucursal/sucursal.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class SucursalPrismaRepository implements SucursalRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(s: any): Sucursal {
    return new Sucursal(
      s.id,
      s.nombre,
      s.tipo,
      s.departamento,
      s.ciudad,
      s.zona,
      s.referencia,
      s.estado,
      s.modalidadVentaPaquete,
    );
  }

  async findAll(): Promise<Sucursal[]> {
    const rows = await this.prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    return rows.map((s) => this.toEntity(s));
  }

  async crear(data: CrearSucursalInput): Promise<Sucursal> {
    const s = await this.prisma.sucursal.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo as any,
        departamento: data.departamento,
        ciudad: data.ciudad,
        zona: data.zona,
        referencia: data.referencia,
        modalidadVentaPaquete: data.modalidadVentaPaquete as any,
      },
    });
    return this.toEntity(s);
  }

  async actualizar(id: number, data: ActualizarSucursalInput): Promise<Sucursal> {
    const s = await this.prisma.sucursal.update({
      where: { id },
      data: {
        nombre: data.nombre,
        tipo: data.tipo as any,
        departamento: data.departamento,
        ciudad: data.ciudad,
        zona: data.zona,
        referencia: data.referencia,
        modalidadVentaPaquete: data.modalidadVentaPaquete as any,
      },
    });
    return this.toEntity(s);
  }

  async cambiarEstado(id: number, estado: boolean): Promise<Sucursal> {
    const s = await this.prisma.sucursal.update({ where: { id }, data: { estado } });
    return this.toEntity(s);
  }
}
