import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesPermitidos || rolesPermitidos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !rolesPermitidos.includes(user.rol)) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }
    return true;
  }
}
