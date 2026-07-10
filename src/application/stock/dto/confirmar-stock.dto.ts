import { IsInt, Min } from 'class-validator';

export class ConfirmarStockDto {
  @IsInt()
  productoId: number;

  @IsInt()
  sucursalId: number;

  @IsInt()
  @Min(0)
  cantidad: number;
}
