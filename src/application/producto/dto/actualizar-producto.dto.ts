import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nombresAlternativos?: string[];

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsIn(['CARPINTERIA', 'FERRETERIA', 'PLOMERIA', 'ELECTRICO'])
  tipoProducto?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  unidadesPorPaquete?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  unidadesPorCaja?: number;

  @IsOptional()
  @IsBoolean()
  ventaSoloPorPaquete?: boolean;

  @IsOptional()
  @IsString()
  unidadVenta?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  unidadVentaTamano?: number;
}
