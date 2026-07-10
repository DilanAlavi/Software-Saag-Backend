import { Injectable } from '@nestjs/common';

const TTL_MS = 15 * 60_000;

interface Entrada {
  activo: boolean;
  expiraEn: number;
}

@Injectable()
export class UsuarioActivoCacheService {
  private cache = new Map<number, Entrada>();

  obtener(id: number): boolean | undefined {
    const entrada = this.cache.get(id);
    if (!entrada) return undefined;
    if (Date.now() > entrada.expiraEn) {
      this.cache.delete(id);
      return undefined;
    }
    return entrada.activo;
  }

  guardar(id: number, activo: boolean): void {
    this.cache.set(id, { activo, expiraEn: Date.now() + TTL_MS });
  }

  invalidar(id: number): void {
    this.cache.delete(id);
  }
}
