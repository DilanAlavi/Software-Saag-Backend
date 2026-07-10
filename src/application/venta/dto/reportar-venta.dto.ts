import { IsString, MinLength } from 'class-validator';

export class ReportarVentaDto {
  @IsString()
  @MinLength(3)
  mensaje: string;
}
