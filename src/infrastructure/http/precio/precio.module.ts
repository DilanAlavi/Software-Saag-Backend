import { Module } from '@nestjs/common';
import { PrecioController } from './precio.controller';
import { PrecioService } from '../../../application/precio/precio.service';
import { PrecioPrismaRepository } from '../../persistence/prisma/precio.prisma.repository';
import { PRECIO_REPOSITORY } from '../../../domain/precio/precio.repository';

@Module({
  controllers: [PrecioController],
  providers: [
    PrecioService,
    { provide: PRECIO_REPOSITORY, useClass: PrecioPrismaRepository },
  ],
  exports: [PRECIO_REPOSITORY],
})
export class PrecioModule {}
