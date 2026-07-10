import { IsIn, IsOptional, IsString } from 'class-validator';

const CATEGORIAS_VALIDAS = ['MAYOR_1', 'MAYOR_2', 'STANDARD_1', 'STANDARD_2', 'CARPINTERIA', 'PLOMERIA', 'ELECTRICISTA'];

export class CrearClienteDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsOptional()
  @IsString()
  ci?: string;

  @IsString()
  celular: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsIn(CATEGORIAS_VALIDAS)
  rol: string;
}
