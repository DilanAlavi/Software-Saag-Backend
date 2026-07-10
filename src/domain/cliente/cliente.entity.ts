export type RolCliente =
  | 'MAYOR_1'
  | 'MAYOR_2'
  | 'STANDARD_1'
  | 'STANDARD_2'
  | 'CARPINTERIA'
  | 'PLOMERIA'
  | 'ELECTRICISTA';

export interface GrupoDeCliente {
  id: number;
  nombre: string;
  categoriaAsignada: string;
}

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
    public readonly fechaRegistro?: Date,
    public readonly grupos?: GrupoDeCliente[],
  ) {}
}
