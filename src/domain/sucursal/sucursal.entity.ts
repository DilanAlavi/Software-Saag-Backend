export type TipoUbicacion = 'CENTRAL' | 'SUCURSAL' | 'DEPOSITO';
export type ModalidadVentaPaquete = 'PIEZA' | 'PAQUETE' | 'AMBOS';

export class Sucursal {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly tipo: TipoUbicacion,
    public readonly departamento: string | null,
    public readonly ciudad: string | null,
    public readonly zona: string | null,
    public readonly referencia: string | null,
    public readonly estado: boolean,
    public readonly modalidadVentaPaquete: ModalidadVentaPaquete | null,
  ) {}
}
