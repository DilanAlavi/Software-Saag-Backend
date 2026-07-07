import { Module } from '@nestjs/common';
import { SucursalController } from './sucursal.controller';
import { SucursalService } from '../../../application/sucursal/sucursal.service';
import { SucursalPrismaRepository } from '../../persistence/prisma/sucursal.prisma.repository';
import { SUCURSAL_REPOSITORY } from '../../../domain/sucursal/sucursal.repository';

@Module({
  controllers: [SucursalController],
  providers: [
    SucursalService,
    { provide: SUCURSAL_REPOSITORY, useClass: SucursalPrismaRepository },
  ],
})
export class SucursalModule {}
