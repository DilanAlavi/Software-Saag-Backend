import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  @Min(0)
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precioCosto?: number;
}
