export class Marca {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly estado: boolean,
    public readonly fechaRegistro: Date,
  ) {}
}
