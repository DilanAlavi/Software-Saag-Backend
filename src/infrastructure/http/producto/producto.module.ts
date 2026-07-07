import { Module } from '@nestjs/common';
import { ProductoController } from './producto.controller';
import { ProductoService } from '../../../application/producto/producto.service';
import { PrismaService } from '../../persistence/prisma/prisma.service';
import { ProductoPrismaRepository } from '../../persistence/prisma/producto.prisma.repository';
import { PRODUCTO_REPOSITORY } from '../../../domain/producto/producto.repository';

@Module({
  controllers: [ProductoController],
  providers: [
    ProductoService,
    PrismaService,
    { provide: PRODUCTO_REPOSITORY, useClass: ProductoPrismaRepository },
  ],
})
export class ProductoModule {}
