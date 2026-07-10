import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { VENTA_REPOSITORY, VentaFiltros, VentaRepository } from '../../domain/venta/venta.repository';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { CotizarVentaDto } from './dto/cotizar-venta.dto';
import { PagarVentaDto } from './dto/pagar-venta.dto';
import { CancelarVentaDto } from './dto/cancelar-venta.dto';
import { EntregarVentaDto } from './dto/entregar-venta.dto';
import { ReportarVentaDto } from './dto/reportar-venta.dto';

interface UsuarioActual {
  sub: number;
  rol: string;
  sucursalId: number | null;
}

@Injectable()
export class VentaService {
  constructor(
    @Inject(VENTA_REPOSITORY)
    private readonly ventaRepository: VentaRepository,
  ) {}

  private resolverSucursalId(usuarioActual: UsuarioActual, sucursalIdDto?: number): number {
    if (usuarioActual.rol === 'ADMIN') {
      if (!sucursalIdDto) {
        throw new BadRequestException('Como Admin, debes indicar de qué sucursal es la venta');
      }
      return sucursalIdDto;
    }
    if (!usuarioActual.sucursalId) {
      throw new BadRequestException('Tu usuario no tiene una sucursal asignada');
    }
    return usuarioActual.sucursalId;
  }

  async cotizar(usuarioActual: UsuarioActual, dto: CotizarVentaDto) {
    const sucursalId = this.resolverSucursalId(usuarioActual, dto.sucursalId);
    try {
      return await this.ventaRepository.cotizar({ clienteId: dto.clienteId, sucursalId, lineas: dto.lineas });
    } catch (e: any) {
      throw new BadRequestException(e.message ?? 'No se pudo cotizar la venta');
    }
  }

  async crear(usuarioActual: UsuarioActual, dto: CrearVentaDto) {
    const sucursalId = this.resolverSucursalId(usuarioActual, dto.sucursalId);

    if (dto.pagarAhora && dto.efectivoRecibido === undefined) {
      throw new BadRequestException('Indica el efectivo recibido para registrar el pago');
    }

    try {
      return await this.ventaRepository.crear({
        clienteId: dto.clienteId,
        usuarioId: usuarioActual.sub,
        sucursalId,
        lineas: dto.lineas,
        pagarAhora: dto.pagarAhora,
        efectivoRecibido: dto.efectivoRecibido,
      });
    } catch (e: any) {
      throw new BadRequestException(e.message ?? 'No se pudo registrar la venta');
    }
  }

  listar(filtros: VentaFiltros) {
    return this.ventaRepository.listar(filtros);
  }

  async obtener(id: number) {
    const venta = await this.ventaRepository.obtener(id);
    if (!venta) throw new BadRequestException('Venta no encontrada');
    return venta;
  }

  async pagar(id: number, dto: PagarVentaDto) {
    try {
      return await this.ventaRepository.pagar(id, dto.efectivoRecibido);
    } catch (e: any) {
      throw new BadRequestException(e.message ?? 'No se pudo registrar el pago');
    }
  }

  async cancelar(id: number, dto: CancelarVentaDto) {
    try {
      return await this.ventaRepository.cancelar(id, dto.motivo);
    } catch (e: any) {
      throw new BadRequestException(e.message ?? 'No se pudo cancelar la venta');
    }
  }

  entregar(id: number, dto: EntregarVentaDto) {
    return this.ventaRepository.entregar(id, dto.detalleIds);
  }

  reportar(id: number, dto: ReportarVentaDto) {
    return this.ventaRepository.reportar(id, dto.mensaje);
  }
}
