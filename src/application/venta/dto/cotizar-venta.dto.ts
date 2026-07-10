import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { LineaVentaDto } from './crear-venta.dto';

export class CotizarVentaDto {
  @IsInt()
  clienteId: number;

  @IsOptional()
  @IsInt()
  sucursalId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineaVentaDto)
  lineas: LineaVentaDto[];
}
