export type RolCliente =
  | 'MAYOR_1'
  | 'MAYOR_2'
  | 'REGULAR'
  | 'REGULAR_2'
  | 'CARPINTERO'
  | 'PLOMERO';

export class Cliente {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly apellidoPaterno: string,
    public readonly apellidoMaterno: string | null,
    public readonly ci: string | null,
    public readonly celular: string,
    public readonly genero: string | null,
    public readonly rol: RolCliente,
    public readonly estado: boolean,
    public readonly sucursalId: number | null,
    public readonly fechaRegistro?: Date,
    public readonly sucursal?: { id: number; nombre: string; tipo: string } | null,
  ) {}
}
