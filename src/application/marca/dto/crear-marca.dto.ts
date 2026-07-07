import { IsString } from 'class-validator';

export class CrearMarcaDto {
  @IsString()
  nombre: string;
}
