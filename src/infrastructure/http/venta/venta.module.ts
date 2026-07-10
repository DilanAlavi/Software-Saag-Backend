import { Module } from '@nestjs/common';
import { VentaController } from './venta.controller';
import { VentaService } from '../../../application/venta/venta.service';
import { ProformaPdfService } from '../../../application/venta/proforma-pdf.service';
import { VentaPrismaRepository } from '../../persistence/prisma/venta.prisma.repository';
import { VENTA_REPOSITORY } from '../../../domain/venta/venta.repository';

@Module({
  controllers: [VentaController],
  providers: [
    VentaService,
    ProformaPdfService,
    { provide: VENTA_REPOSITORY, useClass: VentaPrismaRepository },
  ],
})
export class VentaModule {}
