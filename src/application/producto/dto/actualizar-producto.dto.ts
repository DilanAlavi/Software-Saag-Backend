import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

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
}
