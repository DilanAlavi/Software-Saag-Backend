import { Module } from '@nestjs/common';
import { GananciaController } from './ganancia.controller';
import { GananciaService } from '../../../application/ganancia/ganancia.service';
import { GananciaPrismaRepository } from '../../persistence/prisma/ganancia.prisma.repository';
import { GANANCIA_REPOSITORY } from '../../../domain/ganancia/ganancia.repository';

@Module({
  controllers: [GananciaController],
  providers: [
    GananciaService,
    { provide: GANANCIA_REPOSITORY, useClass: GananciaPrismaRepository },
  ],
})
export class GananciaModule {}
