import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GuardarStockDto {
  @IsInt()
  productoId: number;

  @IsInt()
  sucursalId: number;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidad?: number;
}
