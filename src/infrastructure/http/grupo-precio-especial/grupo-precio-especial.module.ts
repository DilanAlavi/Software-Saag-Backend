import { Module } from '@nestjs/common';
import { GrupoPrecioEspecialController } from './grupo-precio-especial.controller';
import { GrupoPrecioEspecialService } from '../../../application/grupo-precio-especial/grupo-precio-especial.service';
import { GrupoPrecioEspecialPrismaRepository } from '../../persistence/prisma/grupo-precio-especial.prisma.repository';
import { GRUPO_PRECIO_ESPECIAL_REPOSITORY } from '../../../domain/grupo-precio-especial/grupo-precio-especial.repository';

@Module({
  controllers: [GrupoPrecioEspecialController],
  providers: [
    GrupoPrecioEspecialService,
    { provide: GRUPO_PRECIO_ESPECIAL_REPOSITORY, useClass: GrupoPrecioEspecialPrismaRepository },
  ],
})
export class GrupoPrecioEspecialModule {}
