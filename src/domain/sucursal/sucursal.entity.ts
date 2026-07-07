export type TipoUbicacion = 'CENTRAL' | 'SUCURSAL' | 'DEPOSITO';

export class Sucursal {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly tipo: TipoUbicacion,
    public readonly estado: boolean,
  ) {}
}
