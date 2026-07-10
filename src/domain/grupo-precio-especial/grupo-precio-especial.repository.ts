export const GRUPO_PRECIO_ESPECIAL_REPOSITORY = 'GRUPO_PRECIO_ESPECIAL_REPOSITORY';

export interface CrearGrupoInput {
  nombre: string;
  categoriaAsignada: string;
}

export interface ActualizarGrupoInput {
  nombre?: string;
  categoriaAsignada?: string;
}

export interface GrupoConDetalle {
  id: number;
  nombre: string;
  categoriaAsignada: string;
  estado: boolean;
  productos: { id: number; nombre: string }[];
  clientes: { id: number; nombre: string; apellidoPaterno: string }[];
}

export interface GrupoPrecioEspecialRepository {
  listar(): Promise<GrupoConDetalle[]>;
  crear(data: CrearGrupoInput): Promise<GrupoConDetalle>;
  actualizar(grupoId: number, data: ActualizarGrupoInput): Promise<GrupoConDetalle>;
  agregarProducto(grupoId: number, productoId: number): Promise<GrupoConDetalle>;
  quitarProducto(grupoId: number, productoId: number): Promise<GrupoConDetalle>;
  agregarCliente(grupoId: number, clienteId: number): Promise<GrupoConDetalle>;
  quitarCliente(grupoId: number, clienteId: number): Promise<GrupoConDetalle>;
  cambiarEstado(grupoId: number, estado: boolean): Promise<GrupoConDetalle>;
}
