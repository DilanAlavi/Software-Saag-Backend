import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  @Min(0)
  stock: number;
}
