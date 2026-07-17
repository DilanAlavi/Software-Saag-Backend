import { Inject, Injectable } from '@nestjs/common';
import { GANANCIA_REPOSITORY, GananciaRepository } from '../../domain/ganancia/ganancia.repository';

interface UsuarioActual {
  sub: number;
  rol: string;
  sucursalId: number | null;
}

function fechaDeHoy(): string {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();
  const local = new Date(ahora.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function mesActual(): string {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
}

function restarMeses(mes: string, cantidad: number): string {
  const [anio, mesNumero] = mes.split('-').map(Number);
  const fecha = new Date(anio, mesNumero - 1 - cantidad, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class GananciaService {
  constructor(
    @Inject(GANANCIA_REPOSITORY)
    private readonly gananciaRepository: GananciaRepository,
  ) {}

  private resolverSucursalId(usuarioActual: UsuarioActual, sucursalIdQuery?: number): number | undefined {
    if (usuarioActual.rol === 'ADMIN_SUCURSAL') {
      return usuarioActual.sucursalId ?? undefined;
    }
    return sucursalIdQuery;
  }

  resumenDia(usuarioActual: UsuarioActual, fecha: string | undefined, sucursalIdQuery?: number) {
    const sucursalId = this.resolverSucursalId(usuarioActual, sucursalIdQuery);
    return this.gananciaRepository.resumenDia(fecha ?? fechaDeHoy(), { sucursalId });
  }

  ultimasVentas(usuarioActual: UsuarioActual, limit: number | undefined, sucursalIdQuery?: number) {
    const sucursalId = this.resolverSucursalId(usuarioActual, sucursalIdQuery);
    return this.gananciaRepository.ultimasVentas(limit ?? 10, { sucursalId });
  }

  historialMensual(usuarioActual: UsuarioActual, sucursalIdQuery?: number, desdeQuery?: string, hastaQuery?: string) {
    const sucursalId = this.resolverSucursalId(usuarioActual, sucursalIdQuery);
    const hasta = hastaQuery ?? mesActual();
    const desde = desdeQuery ?? restarMeses(hasta, 4);
    return this.gananciaRepository.historialMensual({ sucursalId, desde, hasta });
  }

  historialAnual(usuarioActual: UsuarioActual, sucursalIdQuery?: number) {
    const sucursalId = this.resolverSucursalId(usuarioActual, sucursalIdQuery);
    return this.gananciaRepository.historialAnual({ sucursalId });
  }
}
