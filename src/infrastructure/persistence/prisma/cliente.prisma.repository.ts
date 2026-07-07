import { Injectable } from '@nestjs/common';
import { ClienteFiltros, ClienteRepository } from '../../../domain/cliente/cliente.repository';
import { HistorialEstado } from '../../../domain/usuario/usuario.repository';
import { Cliente } from '../../../domain/cliente/cliente.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class ClientePrismaRepository implements ClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(c: any): Cliente {
    return new Cliente(
      c.id,
      c.nombre,
      c.apellidoPaterno,
      c.apellidoMaterno,
      c.ci,
      c.celular,
      c.genero,
      c.rol,
      c.estado,
      c.sucursalId,
    );
  }

  async findById(id: number): Promise<Cliente | null> {
    const c = await this.prisma.cliente.findUnique({ where: { id } });
    return c ? this.toEntity(c) : null;
  }

  async findAll(filtros: ClienteFiltros): Promise<Cliente[]> {
    const where: any = {};
    if (filtros.rol) {
      where.rol = filtros.rol;
    }
    if (filtros.search) {
      where.OR = [
        { nombre: { contains: filtros.search, mode: 'insensitive' } },
        { apellidoPaterno: { contains: filtros.search, mode: 'insensitive' } },
        { apellidoMaterno: { contains: filtros.search, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.cliente.findMany({
      where,
      include: { sucursal: true },
      orderBy: [{ nombre: 'asc' }, { apellidoPaterno: 'asc' }],
    });

    return rows.map((c) => ({
      ...this.toEntity(c),
      sucursal: c.sucursal ? { id: c.sucursal.id, nombre: c.sucursal.nombre, tipo: c.sucursal.tipo } : null,
      fechaRegistro: c.fechaRegistro,
    })) as any;
  }

  async updateEstadoConHistorial(id: number, estadoNuevo: boolean, realizadoPorId: number): Promise<Cliente> {
    return this.prisma.$transaction(async (tx) => {
      const anterior = await tx.cliente.findUniqueOrThrow({ where: { id } });
      const actualizado = await tx.cliente.update({ where: { id }, data: { estado: estadoNuevo } });
      await tx.historialEstadoCliente.create({
        data: {
          clienteId: id,
          estadoAnterior: anterior.estado,
          estadoNuevo,
          realizadoPorId,
        },
      });
      return this.toEntity(actualizado);
    });
  }

  async historial(clienteId: number): Promise<HistorialEstado[]> {
    const rows = await this.prisma.historialEstadoCliente.findMany({
      where: { clienteId },
      orderBy: { fecha: 'desc' },
    });
    return rows;
  }
}
