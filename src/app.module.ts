import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { ProductoModule } from './infrastructure/http/producto/producto.module';
import { AuthModule } from './infrastructure/http/auth/auth.module';
import { UsuarioModule } from './infrastructure/http/usuario/usuario.module';
import { ClienteModule } from './infrastructure/http/cliente/cliente.module';
import { SucursalModule } from './infrastructure/http/sucursal/sucursal.module';
import { PrecioModule } from './infrastructure/http/precio/precio.module';
import { StockModule } from './infrastructure/http/stock/stock.module';
import { GrupoPrecioEspecialModule } from './infrastructure/http/grupo-precio-especial/grupo-precio-especial.module';
import { VentaModule } from './infrastructure/http/venta/venta.module';

@Module({
  imports: [
    // Qué archivo .env se usa lo decide el comando de npm que se corre (ver package.json:
    // "start:dev" = staging, "start:dev:prod" = producción), no una variable a mano.
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SecurityModule,
    ProductoModule,
    AuthModule,
    UsuarioModule,
    ClienteModule,
    SucursalModule,
    PrecioModule,
    StockModule,
    GrupoPrecioEspecialModule,
    VentaModule,
  ],
})
export class AppModule {}
