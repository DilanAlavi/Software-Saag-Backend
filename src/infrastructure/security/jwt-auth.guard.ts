import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../persistence/prisma/prisma.service';
import { UsuarioActivoCacheService } from './usuario-activo-cache.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly usuarioActivoCache: UsuarioActivoCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Verificación en vivo: aunque el token siga siendo válido, si el usuario fue
    // desactivado, se le corta el acceso. Para no consultar la base en cada pedido,
    // el resultado se guarda en memoria por 15 minutos; si a alguien lo desactivan
    // en el medio, esa entrada se invalida al instante desde UsuarioService.
    let activo = this.usuarioActivoCache.obtener(payload.sub);
    if (activo === undefined) {
      const usuario = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
      activo = Boolean(usuario?.estado);
      this.usuarioActivoCache.guardar(payload.sub, activo);
    }
    if (!activo) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    request.user = payload;
    return true;
  }
}
