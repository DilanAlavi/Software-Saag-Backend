import { Injectable } from '@nestjs/common';
import { ActualizarClienteInput, ClienteFiltros, ClienteRepository, CrearClienteInput } from '../../../domain/cliente/cliente.repository';
import { HistorialEstado } from '../../../domain/usuario/usuario.repository';
import { Cliente } from '../../../domain/cliente/cliente.entity';
import { PrismaService } from './prisma.service';

const INCLUIR_GRUPOS = {
  gruposPrecioEspecial: { include: { grupo: true } },
} as const;

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
      c.fechaRegistro,
      c.gruposPrecioEspecial
        ? c.gruposPrecioEspecial.map((g: any) => ({
            id: g.grupo.id,
            nombre: g.grupo.nombre,
            categoriaAsignada: g.grupo.categoriaAsignada,
          }))
        : undefined,
    );
  }

  async findById(id: number): Promise<Cliente | null> {
    const c = await this.prisma.cliente.findUnique({ where: { id }, include: INCLUIR_GRUPOS });
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
        { ci: { contains: filtros.search, mode: 'insensitive' } },
        { celular: { contains: filtros.search, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.cliente.findMany({
      where,
      include: INCLUIR_GRUPOS,
      orderBy: [{ nombre: 'asc' }, { apellidoPaterno: 'asc' }],
    });

    return rows.map((c) => this.toEntity(c));
  }

  async crear(data: CrearClienteInput): Promise<Cliente> {
    const c = await this.prisma.cliente.create({
      data: {
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        ci: data.ci,
        celular: data.celular,
        genero: data.genero,
        rol: data.rol as any,
      },
    });
    return this.toEntity(c);
  }

  async actualizar(id: number, data: ActualizarClienteInput): Promise<Cliente> {
    const c = await this.prisma.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        ci: data.ci,
        celular: data.celular,
        genero: data.genero,
        rol: data.rol as any,
      },
      include: INCLUIR_GRUPOS,
    });
    return this.toEntity(c);
  }

  async updateEstadoConHistorial(id: number, estadoNuevo: boolean, realizadoPorId: number): Promise<Cliente> {
    return this.prisma.$transaction(async (tx) => {
      const anterior = await tx.cliente.findUniqueOrThrow({ where: { id } });
      const actualizado = await tx.cliente.update({ where: { id }, data: { estado: estadoNuevo }, include: INCLUIR_GRUPOS });
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
