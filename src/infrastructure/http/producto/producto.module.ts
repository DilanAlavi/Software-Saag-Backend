import { Module } from '@nestjs/common';
import { ProductoController } from './producto.controller';
import { ProductoService } from '../../../application/producto/producto.service';
import { ImportacionProductoService } from '../../../application/producto/importacion-producto.service';
import { ProductoPrismaRepository } from '../../persistence/prisma/producto.prisma.repository';
import { PRODUCTO_REPOSITORY } from '../../../domain/producto/producto.repository';
import { PrecioModule } from '../precio/precio.module';

@Module({
  imports: [PrecioModule],
  controllers: [ProductoController],
  providers: [
    ProductoService,
    ImportacionProductoService,
    { provide: PRODUCTO_REPOSITORY, useClass: ProductoPrismaRepository },
  ],
})
export class ProductoModule {}
