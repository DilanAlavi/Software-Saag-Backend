export type TipoProducto = 'CARPINTERIA' | 'FERRETERIA' | 'PLOMERIA' | 'ELECTRICO';

export class Producto {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly nombresAlternativos: string[],
    public readonly marca: string | null,
    public readonly tipoProducto: TipoProducto,
    public readonly codigo: string | null,
    public readonly estado: boolean,
    public readonly fechaRegistro: Date,
    public readonly unidadesPorPaquete: number | null,
    public readonly unidadesPorCaja: number | null,
    public readonly ventaSoloPorPaquete: boolean,
    public readonly unidadVenta: string | null,
    public readonly unidadVentaTamano: number | null,
  ) {}
}
