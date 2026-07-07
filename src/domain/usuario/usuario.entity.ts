export type RolUsuario = 'ADMIN' | 'ADMIN_SUCURSAL' | 'VENDEDOR';

export class Usuario {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    public readonly apellidoPaterno: string,
    public readonly apellidoMaterno: string | null,
    public readonly ci: string | null,
    public readonly celular: string,
    public readonly genero: string | null,
    public readonly username: string,
    public readonly password: string,
    public readonly rol: RolUsuario,
    public readonly estado: boolean,
    public readonly sucursalId: number | null,
    public readonly fechaRegistro?: Date,
    public readonly sucursal?: { id: number; nombre: string; tipo: string } | null,
  ) {}
}
