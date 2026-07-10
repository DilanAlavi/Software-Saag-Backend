export class Precio {
  constructor(
    public readonly id: number,
    public readonly productoId: number,
    public readonly precioCosto: number,
    public readonly menor1: number,
    public readonly menor2: number,
    public readonly mayor1: number,
    public readonly mayor2: number,
    public readonly plomeria: number,
    public readonly carpinteria: number,
    public readonly electricista: number,
    public readonly precioCaja: number | null,
    public readonly precioPiezaSuelta: number | null,
    public readonly cantidadMinimaDescuentoMenor1: number | null,
    public readonly precioDescuentoMenor1: number | null,
    public readonly fechaActualizacion: Date,
  ) {}
}
