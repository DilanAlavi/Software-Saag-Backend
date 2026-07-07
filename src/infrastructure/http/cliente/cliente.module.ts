import { Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';
import { ClienteService } from '../../../application/cliente/cliente.service';
import { ClientePrismaRepository } from '../../persistence/prisma/cliente.prisma.repository';
import { CLIENTE_REPOSITORY } from '../../../domain/cliente/cliente.repository';

@Module({
  controllers: [ClienteController],
  providers: [
    ClienteService,
    { provide: CLIENTE_REPOSITORY, useClass: ClientePrismaRepository },
  ],
})
export class ClienteModule {}
