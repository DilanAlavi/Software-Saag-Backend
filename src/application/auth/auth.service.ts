import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../domain/usuario/usuario.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const usuario = await this.usuarioRepository.findByUsername(username);

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const payload = {
      sub: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidoPaterno: usuario.apellidoPaterno,
        rol: usuario.rol,
        sucursalId: usuario.sucursalId,
        sucursal: usuario.sucursal ? { id: usuario.sucursal.id, nombre: usuario.sucursal.nombre } : null,
      },
    };
  }
}
