import { Injectable } from '@nestjs/common';
import {
  ActualizarGrupoInput,
  CrearGrupoInput,
  GrupoConDetalle,
  GrupoPrecioEspecialRepository,
} from '../../../domain/grupo-precio-especial/grupo-precio-especial.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class GrupoPrecioEspecialPrismaRepository implements GrupoPrecioEspecialRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async findOneConDetalle(id: number): Promise<GrupoConDetalle> {
    const g = await this.prisma.grupoPrecioEspecial.findUniqueOrThrow({
      where: { id },
      include: {
        productos: { include: { producto: true } },
        clientes: { include: { cliente: true } },
      },
    });
    return this.toDetalle(g);
  }

  private toDetalle(g: any): GrupoConDetalle {
    return {
      id: g.id,
      nombre: g.nombre,
      categoriaAsignada: g.categoriaAsignada,
      estado: g.estado,
      productos: g.productos.map((p: any) => ({ id: p.producto.id, nombre: p.producto.nombre })),
      clientes: g.clientes.map((c: any) => ({
        id: c.cliente.id,
        nombre: c.cliente.nombre,
        apellidoPaterno: c.cliente.apellidoPaterno,
      })),
    };
  }

  async listar(): Promise<GrupoConDetalle[]> {
    const grupos = await this.prisma.grupoPrecioEspecial.findMany({
      where: { estado: true },
      include: {
        productos: { include: { producto: true } },
        clientes: { include: { cliente: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    return grupos.map((g) => this.toDetalle(g));
  }

  async crear(data: CrearGrupoInput): Promise<GrupoConDetalle> {
    const g = await this.prisma.grupoPrecioEspecial.create({
      data: { nombre: data.nombre, categoriaAsignada: data.categoriaAsignada as any },
    });
    return this.findOneConDetalle(g.id);
  }

  async actualizar(grupoId: number, data: ActualizarGrupoInput): Promise<GrupoConDetalle> {
    await this.prisma.grupoPrecioEspecial.update({
      where: { id: grupoId },
      data: { nombre: data.nombre, categoriaAsignada: data.categoriaAsignada as any },
    });
    return this.findOneConDetalle(grupoId);
  }

  async agregarProducto(grupoId: number, productoId: number): Promise<GrupoConDetalle> {
    await this.prisma.grupoPrecioEspecialProducto.create({ data: { grupoId, productoId } });
    return this.findOneConDetalle(grupoId);
  }

  async quitarProducto(grupoId: number, productoId: number): Promise<GrupoConDetalle> {
    await this.prisma.grupoPrecioEspecialProducto.deleteMany({ where: { grupoId, productoId } });
    return this.findOneConDetalle(grupoId);
  }

  async agregarCliente(grupoId: number, clienteId: number): Promise<GrupoConDetalle> {
    await this.prisma.clienteGrupoPrecioEspecial.create({ data: { grupoId, clienteId } });
    return this.findOneConDetalle(grupoId);
  }

  async quitarCliente(grupoId: number, clienteId: number): Promise<GrupoConDetalle> {
    await this.prisma.clienteGrupoPrecioEspecial.deleteMany({ where: { grupoId, clienteId } });
    return this.findOneConDetalle(grupoId);
  }

  async cambiarEstado(grupoId: number, estado: boolean): Promise<GrupoConDetalle> {
    await this.prisma.grupoPrecioEspecial.update({ where: { id: grupoId }, data: { estado } });
    return this.findOneConDetalle(grupoId);
  }
}
