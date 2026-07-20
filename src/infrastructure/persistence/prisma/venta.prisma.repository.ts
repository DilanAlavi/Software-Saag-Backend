import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CotizarVentaInput,
  CrearVentaInput,
  LineaCotizada,
  VentaCotizada,
  VentaFiltros,
  VentaListado,
  VentaRepository,
} from '../../../domain/venta/venta.repository';
import { VentaConDetalle } from '../../../domain/venta/venta.entity';
import { resolverPrecioLinea, ModalidadVenta } from '../../../domain/venta/resolucion-precio';
import { PrismaService } from './prisma.service';

@Injectable()
export class VentaPrismaRepository implements VentaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDetalle(v: any): VentaConDetalle {
    return {
      id: v.id,
      cliente: {
        id: v.cliente.id,
        nombre: v.cliente.nombre,
        apellidoPaterno: v.cliente.apellidoPaterno,
        celular: v.cliente.celular,
      },
      usuario: { id: v.usuario.id, nombre: v.usuario.nombre, apellidoPaterno: v.usuario.apellidoPaterno },
      sucursal: { id: v.sucursal.id, nombre: v.sucursal.nombre },
      estado: v.estado,
      motivoCancelacion: v.motivoCancelacion,
      fecha: v.fecha,
      total: Number(v.total),
      efectivoRecibido: v.efectivoRecibido !== null ? Number(v.efectivoRecibido) : null,
      vuelto: v.vuelto !== null ? Number(v.vuelto) : null,
      fechaPago: v.fechaPago,
      reporte: v.reporte,
      fechaReporte: v.fechaReporte,
      detalles: v.detalles.map((d: any) => ({
        id: d.id,
        productoId: d.productoId,
        nombreProducto: d.nombreProducto,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precioUnitario),
        total: Number(d.total),
        entregado: d.entregado,
        unidadVenta: d.unidadVenta,
        unidadVentaTamano: d.unidadVentaTamano,
      })),
    };
  }

  private includeCompleto = {
    cliente: true,
    usuario: true,
    sucursal: true,
    detalles: true,
  };

  private async resolverLinea(
    db: any,
    clienteRol: string,
    clienteId: number,
    sucursal: { id: number; modalidadVentaPaquete: ModalidadVenta | null },
    linea: { productoId: number; cantidad: number },
  ): Promise<LineaCotizada> {
    const [producto, grupoEspecial, excepcion] = await Promise.all([
      db.producto.findUniqueOrThrow({
        where: { id: linea.productoId },
        include: { precio: true },
      }),
      db.clienteGrupoPrecioEspecial.findFirst({
        where: {
          clienteId,
          grupo: { estado: true, productos: { some: { productoId: linea.productoId } } },
        },
        include: { grupo: true },
      }),
      db.productoModalidadSucursal.findUnique({
        where: { productoId_sucursalId: { productoId: linea.productoId, sucursalId: sucursal.id } },
      }),
    ]);

    if (!producto.precio) {
      throw new Error(`"${producto.nombre}" todavía no tiene precios cargados`);
    }

    // Cascada: excepción puntual producto+sucursal -> default de la sucursal -> default del producto.
    const modalidadVentaEfectiva: ModalidadVenta =
      excepcion?.modalidad ??
      sucursal.modalidadVentaPaquete ??
      (producto.ventaSoloPorPaquete ? 'PAQUETE' : 'PIEZA');

    const resultado = resolverPrecioLinea({
      producto: {
        nombre: producto.nombre,
        tipoProducto: producto.tipoProducto,
        unidadesPorPaquete: producto.unidadesPorPaquete,
        unidadesPorCaja: producto.unidadesPorCaja,
        ventaSoloPorPaquete: producto.ventaSoloPorPaquete,
        unidadVentaTamano: producto.unidadVentaTamano,
        redondeoSiempreArriba: producto.redondeoSiempreArriba,
      },
      precio: {
        precioCosto: Number(producto.precio.precioCosto),
        menor1: Number(producto.precio.menor1),
        menor2: Number(producto.precio.menor2),
        mayor1: Number(producto.precio.mayor1),
        mayor2: Number(producto.precio.mayor2),
        plomeria: Number(producto.precio.plomeria),
        carpinteria: Number(producto.precio.carpinteria),
        electricista: Number(producto.precio.electricista),
        precioCaja: producto.precio.precioCaja !== null ? Number(producto.precio.precioCaja) : null,
        precioPiezaSuelta: producto.precio.precioPiezaSuelta !== null ? Number(producto.precio.precioPiezaSuelta) : null,
        cantidadMinimaDescuentoMenor1: producto.precio.cantidadMinimaDescuentoMenor1,
        precioDescuentoMenor1:
          producto.precio.precioDescuentoMenor1 !== null ? Number(producto.precio.precioDescuentoMenor1) : null,
      },
      rolCliente: clienteRol,
      modalidadVentaEfectiva,
      categoriaGrupoEspecial: grupoEspecial ? grupoEspecial.grupo.categoriaAsignada : null,
      cantidad: linea.cantidad,
    });

    const totalLinea = resultado.precioUnitario * linea.cantidad;
    return {
      productoId: producto.id,
      nombreProducto: producto.nombreParaProforma ?? producto.nombre,
      cantidad: linea.cantidad,
      precioUnitario: resultado.precioUnitario,
      total: totalLinea,
      unidadVenta: producto.unidadVenta,
      unidadVentaTamano: producto.unidadVentaTamano,
    };
  }

  private resolverLineas(
    db: any,
    clienteRol: string,
    clienteId: number,
    sucursal: { id: number; modalidadVentaPaquete: ModalidadVenta | null },
    lineas: { productoId: number; cantidad: number }[],
  ): Promise<LineaCotizada[]> {
    return Promise.all(lineas.map((linea) => this.resolverLinea(db, clienteRol, clienteId, sucursal, linea)));
  }

  async cotizar(input: CotizarVentaInput): Promise<VentaCotizada> {
    const [cliente, sucursal] = await Promise.all([
      this.prisma.cliente.findUniqueOrThrow({ where: { id: input.clienteId } }),
      this.prisma.sucursal.findUniqueOrThrow({ where: { id: input.sucursalId } }),
    ]);
    const lineas = await this.resolverLineas(this.prisma, cliente.rol, input.clienteId, sucursal, input.lineas);
    const total = lineas.reduce((acc, l) => acc + l.total, 0);
    return { lineas, total };
  }

  async crear(input: CrearVentaInput): Promise<VentaConDetalle> {
    return this.prisma.$transaction(
      async (tx) => {
      const [cliente, sucursal] = await Promise.all([
        tx.cliente.findUniqueOrThrow({ where: { id: input.clienteId } }),
        tx.sucursal.findUniqueOrThrow({ where: { id: input.sucursalId } }),
      ]);

      const lineasResueltas = await this.resolverLineas(tx, cliente.rol, input.clienteId, sucursal, input.lineas);

      const total = lineasResueltas.reduce((acc, l) => acc + l.total, 0);
      const pagado = input.pagarAhora && input.efectivoRecibido !== undefined;

      const venta = await tx.venta.create({
        data: {
          clienteId: input.clienteId,
          usuarioId: input.usuarioId,
          sucursalId: input.sucursalId,
          estado: pagado ? 'PAGADO' : 'PENDIENTE',
          total,
          efectivoRecibido: pagado ? input.efectivoRecibido : undefined,
          vuelto: pagado ? input.efectivoRecibido! - total : undefined,
          fechaPago: pagado ? new Date() : undefined,
          detalles: {
            create: lineasResueltas.map((l) => ({
              productoId: l.productoId,
              nombreProducto: l.nombreProducto,
              cantidad: l.cantidad,
              precioUnitario: l.precioUnitario,
              total: l.total,
              unidadVenta: l.unidadVenta,
              unidadVentaTamano: l.unidadVentaTamano,
            })),
          },
        },
        include: this.includeCompleto,
      });

      // Registrar la venta en Stock (contador acumulado siempre; descuenta cantidad solo si está confirmado)
      for (const linea of lineasResueltas) {
        const stockExistente = await tx.stock.findUnique({
          where: { productoId_sucursalId: { productoId: linea.productoId, sucursalId: input.sucursalId } },
        });
        if (!stockExistente) {
          await tx.stock.create({
            data: {
              productoId: linea.productoId,
              sucursalId: input.sucursalId,
              cantidadVendidaAcumulada: linea.cantidad,
            },
          });
        } else {
          await tx.stock.update({
            where: { productoId_sucursalId: { productoId: linea.productoId, sucursalId: input.sucursalId } },
            data: {
              cantidadVendidaAcumulada: stockExistente.cantidadVendidaAcumulada + linea.cantidad,
              cantidad: stockExistente.confirmado
                ? (stockExistente.cantidad ?? 0) - linea.cantidad
                : stockExistente.cantidad,
            },
          });
        }
      }

      return this.toDetalle(venta);
      },
      { timeout: 15000 },
    );
  }

  async listar(filtros: VentaFiltros): Promise<VentaListado> {
    const where: any = {};
    if (filtros.estado) {
      where.estado = filtros.estado;
    }
    if (filtros.sucursalId) {
      where.sucursalId = filtros.sucursalId;
    }
    if (filtros.fecha) {
      const inicio = new Date(`${filtros.fecha}T00:00:00`);
      const fin = new Date(`${filtros.fecha}T23:59:59.999`);
      where.fecha = { gte: inicio, lte: fin };
    }
    if (filtros.desde) {
      where.fecha = { gte: new Date(`${filtros.desde}T00:00:00`) };
    }
    if (filtros.search) {
      if (filtros.searchTipo === 'vendedor') {
        where.usuario = {
          OR: [
            { nombre: { contains: filtros.search, mode: 'insensitive' } },
            { apellidoPaterno: { contains: filtros.search, mode: 'insensitive' } },
            { apellidoMaterno: { contains: filtros.search, mode: 'insensitive' } },
            { username: { contains: filtros.search, mode: 'insensitive' } },
          ],
        };
      } else {
        where.cliente = {
          OR: [
            { nombre: { contains: filtros.search, mode: 'insensitive' } },
            { apellidoPaterno: { contains: filtros.search, mode: 'insensitive' } },
            { apellidoMaterno: { contains: filtros.search, mode: 'insensitive' } },
            { ci: { contains: filtros.search, mode: 'insensitive' } },
            { celular: { contains: filtros.search, mode: 'insensitive' } },
          ],
        };
      }
    }

    const paginar = Boolean(filtros.page && filtros.pageSize);
    const page = filtros.page && filtros.page > 0 ? filtros.page : 1;
    const pageSize = filtros.pageSize && filtros.pageSize > 0 ? filtros.pageSize : 10;

    const [total, ventas] = await Promise.all([
      this.prisma.venta.count({ where }),
      this.prisma.venta.findMany({
        where,
        include: this.includeCompleto,
        orderBy: { fecha: 'desc' },
        ...(paginar ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
      }),
    ]);

    return { ventas: ventas.map((v) => this.toDetalle(v)), total };
  }

  async obtener(id: number): Promise<VentaConDetalle | null> {
    const venta = await this.prisma.venta.findUnique({ where: { id }, include: this.includeCompleto });
    return venta ? this.toDetalle(venta) : null;
  }

  async pagar(id: number, efectivoRecibido: number): Promise<VentaConDetalle> {
    const venta = await this.prisma.venta.findUniqueOrThrow({ where: { id } });
    if (venta.estado !== 'PENDIENTE') {
      throw new Error('Esta venta ya no está pendiente de pago');
    }
    const actualizada = await this.prisma.venta.update({
      where: { id },
      data: {
        estado: 'PAGADO',
        efectivoRecibido,
        vuelto: efectivoRecibido - Number(venta.total),
        fechaPago: new Date(),
      },
      include: this.includeCompleto,
    });
    return this.toDetalle(actualizada);
  }

  async cancelar(id: number, motivo: string): Promise<VentaConDetalle> {
    const venta = await this.prisma.venta.findUniqueOrThrow({ where: { id } });
    if (venta.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden cancelar ventas pendientes de pago');
    }
    const actualizada = await this.prisma.venta.update({
      where: { id },
      data: { estado: 'CANCELADO', motivoCancelacion: motivo as any },
      include: this.includeCompleto,
    });
    return this.toDetalle(actualizada);
  }

  async reportar(id: number, mensaje: string): Promise<VentaConDetalle> {
    const actualizada = await this.prisma.venta.update({
      where: { id },
      data: { reporte: mensaje, fechaReporte: new Date() },
      include: this.includeCompleto,
    });
    return this.toDetalle(actualizada);
  }

  async entregar(id: number, detalleIds: number[]): Promise<VentaConDetalle> {
    await this.prisma.detalleVenta.updateMany({
      where: { id: { in: detalleIds }, ventaId: id },
      data: { entregado: true },
    });
    const venta = await this.prisma.venta.findUnique({ where: { id }, include: this.includeCompleto });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return this.toDetalle(venta);
  }
}
