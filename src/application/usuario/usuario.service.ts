import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { USUARIO_REPOSITORY, UsuarioFiltros, UsuarioRepository } from '../../domain/usuario/usuario.repository';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { generarPassword, generarUsername } from './generar-credenciales';
import { UsuarioActivoCacheService } from '../../infrastructure/security/usuario-activo-cache.service';

interface UsuarioActual {
  sub: number;
  rol: string;
  sucursalId: number | null;
}

@Injectable()
export class UsuarioService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly usuarioActivoCache: UsuarioActivoCacheService,
  ) {}

  listar(usuarioActual: UsuarioActual, filtros: UsuarioFiltros) {
    if (usuarioActual.rol === 'ADMIN_SUCURSAL') {
      filtros = { ...filtros, sucursalId: usuarioActual.sucursalId ?? undefined };
    }
    return this.usuarioRepository.findAll(filtros);
  }

  async crear(usuarioActual: UsuarioActual, dto: CrearUsuarioDto) {
    let rol = dto.rol ?? 'VENDEDOR';
    let sucursalId = dto.sucursalId;

    if (usuarioActual.rol === 'ADMIN_SUCURSAL') {
      rol = 'VENDEDOR';
      sucursalId = usuarioActual.sucursalId ?? undefined;
    }

    let username = generarUsername(dto.apellidoPaterno);
    while (await this.usuarioRepository.findByUsername(username)) {
      username = generarUsername(dto.apellidoPaterno);
    }

    const identificador = dto.ci || dto.celular;
    const passwordPlano = generarPassword(dto.apellidoPaterno, identificador);
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const nuevoUsuario = await this.usuarioRepository.create({
      nombre: dto.nombre,
      apellidoPaterno: dto.apellidoPaterno,
      apellidoMaterno: dto.apellidoMaterno,
      ci: dto.ci,
      celular: dto.celular,
      genero: dto.genero,
      username,
      password: passwordHash,
      rol,
      sucursalId,
    });

    return {
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellidoPaterno: nuevoUsuario.apellidoPaterno,
        rol: nuevoUsuario.rol,
        sucursal: nuevoUsuario.sucursal ?? null,
        fechaRegistro: nuevoUsuario.fechaRegistro,
      },
      credenciales: { username, password: passwordPlano },
    };
  }

  async cambiarEstado(usuarioActual: UsuarioActual, id: number, estadoNuevo: boolean) {
    if (usuarioActual.sub === id) {
      throw new ForbiddenException('No puedes cambiar el estado de tu propia cuenta');
    }

    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuarioActual.rol === 'ADMIN_SUCURSAL') {
      if (usuario.rol !== 'VENDEDOR' || usuario.sucursalId !== usuarioActual.sucursalId) {
        throw new ForbiddenException('No puedes modificar este usuario');
      }
    }

    const actualizado = await this.usuarioRepository.updateEstadoConHistorial(id, estadoNuevo, usuarioActual.sub);
    this.usuarioActivoCache.invalidar(id);
    return actualizado;
  }

  historial(id: number) {
    return this.usuarioRepository.historial(id);
  }
}
