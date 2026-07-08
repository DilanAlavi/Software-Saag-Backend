export class Stock {
  constructor(
    public readonly id: number,
    public readonly productoId: number,
    public readonly sucursalId: number,
    public readonly area: string | null,
    public readonly cantidad: number | null,
    public readonly fechaActualizacion: Date,
  ) {}
}
