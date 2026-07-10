import { IsIn } from 'class-validator';

export class CancelarVentaDto {
  @IsIn(['NO_RECOGIO', 'CLIENTE_CANCELO'])
  motivo: string;
}
