import { ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class EntregarVentaDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  detalleIds: number[];
}
