import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from '../../../application/usuario/usuario.service';
import { UsuarioPrismaRepository } from '../../persistence/prisma/usuario.prisma.repository';
import { USUARIO_REPOSITORY } from '../../../domain/usuario/usuario.repository';

@Module({
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    { provide: USUARIO_REPOSITORY, useClass: UsuarioPrismaRepository },
  ],
})
export class UsuarioModule {}
