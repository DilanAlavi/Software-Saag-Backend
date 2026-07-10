import { IsNumber, Min } from 'class-validator';

export class PagarVentaDto {
  @IsNumber()
  @Min(0)
  efectivoRecibido: number;
}
