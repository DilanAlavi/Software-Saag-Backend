import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CrearUsuarioDto {
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

  @IsOptional()
  @IsIn(['ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR'])
  rol?: string;

  @IsOptional()
  @IsInt()
  sucursalId?: number;
}
