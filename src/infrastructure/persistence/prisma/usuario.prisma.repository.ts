import { Injectable } from '@nestjs/common';
import {
  CrearUsuarioInput,
  HistorialEstado,
  UsuarioFiltros,
  UsuarioRepository,
} from '../../../domain/usuario/usuario.repository';
import { Usuario } from '../../../domain/usuario/usuario.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class UsuarioPrismaRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(u: any): Usuario {
    return new Usuario(
      u.id,
      u.nombre,
      u.apellidoPaterno,
      u.apellidoMaterno,
      u.ci,
      u.celular,
      u.genero,
      u.username,
      u.password,
      u.rol,
      u.estado,
      u.sucursalId,
      u.fechaRegistro,
      u.sucursal ?? null,
    );
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    const u = await this.prisma.usuario.findUnique({ where: { username }, include: { sucursal: true } });
    return u ? this.toEntity(u) : null;
  }

  async findById(id: number): Promise<Usuario | null> {
    const u = await this.prisma.usuario.findUnique({ where: { id } });
    return u ? this.toEntity(u) : null;
  }

  async findAll(filtros: UsuarioFiltros): Promise<Usuario[]> {
    const where: any = {};
    if (filtros.sucursalId !== undefined) {
      where.sucursalId = filtros.sucursalId;
    }
    if (filtros.search) {
      where.OR = [
        { nombre: { contains: filtros.search, mode: 'insensitive' } },
        { apellidoPaterno: { contains: filtros.search, mode: 'insensitive' } },
        { apellidoMaterno: { contains: filtros.search, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.usuario.findMany({
      where,
      include: { sucursal: true },
      orderBy: [{ nombre: 'asc' }, { apellidoPaterno: 'asc' }],
    });

    return rows.map((u) => ({
      ...this.toEntity(u),
      sucursal: u.sucursal ? { id: u.sucursal.id, nombre: u.sucursal.nombre, tipo: u.sucursal.tipo } : null,
      fechaRegistro: u.fechaRegistro,
    })) as any;
  }

  async create(data: CrearUsuarioInput): Promise<Usuario> {
    const u = await this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        ci: data.ci,
        celular: data.celular,
        genero: data.genero,
        username: data.username,
        password: data.password,
        rol: data.rol as any,
        sucursalId: data.sucursalId,
      },
      include: { sucursal: true },
    });
    return {
      ...this.toEntity(u),
      sucursal: u.sucursal ? { id: u.sucursal.id, nombre: u.sucursal.nombre, tipo: u.sucursal.tipo } : null,
      fechaRegistro: u.fechaRegistro,
    } as any;
  }

  async updateEstadoConHistorial(id: number, estadoNuevo: boolean, realizadoPorId: number): Promise<Usuario> {
    return this.prisma.$transaction(async (tx) => {
      const anterior = await tx.usuario.findUniqueOrThrow({ where: { id } });
      const actualizado = await tx.usuario.update({ where: { id }, data: { estado: estadoNuevo } });
      await tx.historialEstadoUsuario.create({
        data: {
          usuarioId: id,
          estadoAnterior: anterior.estado,
          estadoNuevo,
          realizadoPorId,
        },
      });
      return this.toEntity(actualizado);
    });
  }

  async historial(usuarioId: number): Promise<HistorialEstado[]> {
    const rows = await this.prisma.historialEstadoUsuario.findMany({
      where: { usuarioId },
      orderBy: { fecha: 'desc' },
    });
    return rows;
  }
}
