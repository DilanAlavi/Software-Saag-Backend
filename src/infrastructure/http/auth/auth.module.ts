import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../../../application/auth/auth.service';
import { UsuarioPrismaRepository } from '../../persistence/prisma/usuario.prisma.repository';
import { USUARIO_REPOSITORY } from '../../../domain/usuario/usuario.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: USUARIO_REPOSITORY, useClass: UsuarioPrismaRepository },
  ],
})
export class AuthModule {}
