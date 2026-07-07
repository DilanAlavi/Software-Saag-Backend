import { Module } from '@nestjs/common';
import { MarcaController } from './marca.controller';
import { MarcaService } from '../../../application/marca/marca.service';
import { MarcaPrismaRepository } from '../../persistence/prisma/marca.prisma.repository';
import { MARCA_REPOSITORY } from '../../../domain/marca/marca.repository';

@Module({
  controllers: [MarcaController],
  providers: [
    MarcaService,
    { provide: MARCA_REPOSITORY, useClass: MarcaPrismaRepository },
  ],
})
export class MarcaModule {}
