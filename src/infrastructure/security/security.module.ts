import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { UsuarioActivoCacheService } from './usuario-activo-cache.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  providers: [JwtAuthGuard, RolesGuard, UsuarioActivoCacheService],
  exports: [JwtAuthGuard, RolesGuard, JwtModule, UsuarioActivoCacheService],
})
export class SecurityModule {}
