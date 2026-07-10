import { IsIn, IsString } from 'class-validator';

const CATEGORIAS_VALIDAS = ['MAYOR_1', 'MAYOR_2', 'STANDARD_1', 'STANDARD_2', 'CARPINTERIA', 'PLOMERIA', 'ELECTRICISTA'];

export class CrearGrupoDto {
  @IsString()
  nombre: string;

  @IsIn(CATEGORIAS_VALIDAS)
  categoriaAsignada: string;
}
