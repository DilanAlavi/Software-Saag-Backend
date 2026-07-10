import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PRECIO_REPOSITORY, PrecioRepository } from '../../domain/precio/precio.repository';
import { GuardarPrecioDto } from './dto/guardar-precio.dto';

const CATEGORIAS_VENTA: { campo: keyof GuardarPrecioDto; etiqueta: string }[] = [
  { campo: 'menor1', etiqueta: 'Standard 1' },
  { campo: 'menor2', etiqueta: 'Standard 2' },
  { campo: 'mayor1', etiqueta: 'Mayor 1' },
  { campo: 'mayor2', etiqueta: 'Mayor 2' },
  { campo: 'plomeria', etiqueta: 'Plomería' },
  { campo: 'carpinteria', etiqueta: 'Carpintería' },
  { campo: 'electricista', etiqueta: 'Electricista' },
  { campo: 'precioCaja', etiqueta: 'Caja' },
  { campo: 'precioPiezaSuelta', etiqueta: 'Pieza suelta' },
];

@Injectable()
export class PrecioService {
  constructor(
    @Inject(PRECIO_REPOSITORY)
    private readonly precioRepository: PrecioRepository,
  ) {}

  listar() {
    return this.precioRepository.listarConProducto();
  }

  guardar(productoId: number, dto: GuardarPrecioDto) {
    this.validarContraCosto(dto);
    this.validarDescuentoMenor1(dto);
    return this.precioRepository.guardar(productoId, dto);
  }

  private validarContraCosto(dto: GuardarPrecioDto) {
    const errores: string[] = [];
    for (const { campo, etiqueta } of CATEGORIAS_VENTA) {
      const valor = dto[campo] as number | undefined;
      if (valor !== undefined && valor <= dto.precioCosto) {
        errores.push(`El precio "${etiqueta}" (${valor}) debe ser mayor al Precio Base (${dto.precioCosto})`);
      }
    }
    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }
  }

  private validarDescuentoMenor1(dto: GuardarPrecioDto) {
    if (dto.precioDescuentoMenor1 !== undefined && dto.precioDescuentoMenor1 >= dto.menor1) {
      throw new BadRequestException(
        `El precio con descuento (${dto.precioDescuentoMenor1}) debe ser menor al precio normal de Standard 1 (${dto.menor1})`,
      );
    }
    if (dto.precioDescuentoMenor1 !== undefined && dto.cantidadMinimaDescuentoMenor1 === undefined) {
      throw new BadRequestException('Debes indicar la cantidad mínima para aplicar el descuento de Standard 1');
    }
  }
}
