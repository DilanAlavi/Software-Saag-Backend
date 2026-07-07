import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductoModule } from './infrastructure/http/producto/producto.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProductoModule],
})
export class AppModule {}
