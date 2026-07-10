import { IsIn, IsOptional, IsString } from 'class-validator';

export class CrearSucursalDto {
  @IsString()
  nombre: string;

  @IsIn(['CENTRAL', 'SUCURSAL', 'DEPOSITO'])
  tipo: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  zona?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsIn(['PIEZA', 'PAQUETE', 'AMBOS'])
  modalidadVentaPaquete?: string;
}
