export class GrupoPrecioEspecial {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly categoriaAsignada: string,
    public readonly estado: boolean,
  ) {}
}
