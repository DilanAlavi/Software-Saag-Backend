import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class GuardarPrecioDto {
  @IsNumber()
  @Min(0)
  precioCosto: number;

  @IsNumber()
  @Min(0)
  menor1: number;

  @IsNumber()
  @Min(0)
  menor2: number;

  @IsNumber()
  @Min(0)
  mayor1: number;

  @IsNumber()
  @Min(0)
  mayor2: number;

  @IsNumber()
  @Min(0)
  plomeria: number;

  @IsNumber()
  @Min(0)
  carpinteria: number;

  @IsNumber()
  @Min(0)
  electricista: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioCaja?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPiezaSuelta?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadMinimaDescuentoMenor1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioDescuentoMenor1?: number;
}
