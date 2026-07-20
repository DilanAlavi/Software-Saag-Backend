import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CrearProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nombresAlternativos?: string[];

  @IsOptional()
  @IsString()
  marca?: string;

  @IsIn(['CARPINTERIA', 'FERRETERIA', 'PLOMERIA', 'ELECTRICO'])
  tipoProducto: string;

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

  @IsOptional()
  @IsBoolean()
  redondeoSiempreArriba?: boolean;

  @IsOptional()
  @IsString()
  notaVenta?: string;

  @IsOptional()
  @IsString()
  nombreParaProforma?: string;
}
