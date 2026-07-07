import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../persistence/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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

    // Verificación en vivo: aunque el token siga siendo válido, si el usuario
    // fue desactivado después de emitirse, se le corta el acceso de inmediato.
    const usuario = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    request.user = payload;
    return true;
  }
}
