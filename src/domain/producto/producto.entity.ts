export class Producto {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly precio: number,
    public readonly stock: number,
  ) {}
}
