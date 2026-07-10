import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';

export class LineaVentaDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CrearVentaDto {
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

  @IsBoolean()
  pagarAhora: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  efectivoRecibido?: number;
}
