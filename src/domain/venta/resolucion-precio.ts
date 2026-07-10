export interface ProductoParaPrecio {
  nombre: string;
  tipoProducto: string;
  unidadesPorPaquete: number | null;
  /** Si es true, los precios de categoría representan el precio del PAQUETE, no de la pieza. */
  ventaSoloPorPaquete: boolean;
}

export interface PrecioParaResolucion {
  precioCosto: number;
  menor1: number;
  menor2: number;
  mayor1: number;
  mayor2: number;
  plomeria: number;
  carpinteria: number;
  electricista: number;
  precioPiezaSuelta: number | null;
  cantidadMinimaDescuentoMenor1: number | null;
  precioDescuentoMenor1: number | null;
}

export type ModalidadVenta = 'PIEZA' | 'PAQUETE' | 'AMBOS';

const MAPA_RUBRO_CATEGORIA: Record<string, string> = {
  PLOMERIA: 'PLOMERIA',
  CARPINTERIA: 'CARPINTERIA',
  ELECTRICISTA: 'ELECTRICO',
};

const CATEGORIAS_DE_OFICIO = ['PLOMERIA', 'CARPINTERIA', 'ELECTRICISTA'];

export function obtenerPrecioCategoria(precio: PrecioParaResolucion, categoria: string): number {
  switch (categoria) {
    case 'MAYOR_1':
      return precio.mayor1;
    case 'MAYOR_2':
      return precio.mayor2;
    case 'STANDARD_1':
      return precio.menor1;
    case 'STANDARD_2':
      return precio.menor2;
    case 'PLOMERIA':
      return precio.plomeria;
    case 'CARPINTERIA':
      return precio.carpinteria;
    case 'ELECTRICISTA':
      return precio.electricista;
    default:
      throw new Error(`Categoría de precio desconocida: ${categoria}`);
  }
}

/**
 * Categoría efectiva de un cliente para un producto dado, aplicando la regla de rubro:
 * un cliente de oficio (Plomería/Carpintería/Electricista) solo mantiene su precio especial
 * si el producto es de su mismo rubro; si no, cae a Standard 2. Sin cliente registrado = Standard 1.
 */
function categoriaEfectivaDelCliente(rolCliente: string | null, tipoProducto: string): string {
  const categoria = rolCliente ?? 'STANDARD_1';
  if (CATEGORIAS_DE_OFICIO.includes(categoria)) {
    const rubroDelCliente = MAPA_RUBRO_CATEGORIA[categoria];
    if (rubroDelCliente !== tipoProducto) {
      return 'STANDARD_2';
    }
  }
  return categoria;
}

function precioConDescuentoVolumen(precio: PrecioParaResolucion, categoria: string, cantidad: number): number {
  const base = obtenerPrecioCategoria(precio, categoria);
  if (
    categoria === 'STANDARD_1' &&
    precio.cantidadMinimaDescuentoMenor1 !== null &&
    precio.precioDescuentoMenor1 !== null &&
    cantidad >= precio.cantidadMinimaDescuentoMenor1
  ) {
    return precio.precioDescuentoMenor1;
  }
  return base;
}

export interface ResolverPrecioInput {
  producto: ProductoParaPrecio;
  precio: PrecioParaResolucion;
  rolCliente: string | null;
  /** Ya resuelta por el llamador: sucursal.modalidadVentaPaquete ?? (producto.ventaSoloPorPaquete ? 'PAQUETE' : 'PIEZA') */
  modalidadVentaEfectiva: ModalidadVenta;
  categoriaGrupoEspecial: string | null;
  cantidad: number;
}

export interface ResultadoPrecio {
  precioUnitario: number;
  categoriaUsada: string;
}

function precioPorPaquete(
  precio: PrecioParaResolucion,
  categoria: string,
  unidadesPorPaquete: number,
  cantidad: number,
): number {
  const totalPaquetes = cantidad / unidadesPorPaquete;
  const precioCategoria = precioConDescuentoVolumen(precio, categoria, cantidad);
  return (precioCategoria * totalPaquetes) / cantidad;
}

export function resolverPrecioLinea(input: ResolverPrecioInput): ResultadoPrecio {
  const { producto, precio, rolCliente, modalidadVentaEfectiva, categoriaGrupoEspecial, cantidad } = input;

  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  const unidadesPorPaquete = producto.unidadesPorPaquete;
  const esPaqueteCompleto = unidadesPorPaquete !== null && unidadesPorPaquete > 0 && cantidad % unidadesPorPaquete === 0;

  // Caso base: el precio de categoría de este producto YA es por pieza (la gran mayoría de productos).
  // Aquí la modalidad de venta de la sucursal no afecta el precio, solo si se puede vender suelto o no
  // (eso ya se decidió antes de llegar aquí).
  if (!producto.ventaSoloPorPaquete) {
    // 1. Grupo de Precio Especial
    if (categoriaGrupoEspecial) {
      return {
        precioUnitario: precioConDescuentoVolumen(precio, categoriaGrupoEspecial, cantidad),
        categoriaUsada: categoriaGrupoEspecial,
      };
    }
    const categoriaCliente = categoriaEfectivaDelCliente(rolCliente, producto.tipoProducto);
    return {
      precioUnitario: precioConDescuentoVolumen(precio, categoriaCliente, cantidad),
      categoriaUsada: categoriaCliente,
    };
  }

  // A partir de aquí: producto.ventaSoloPorPaquete === true -> los precios de categoría son POR PAQUETE.
  if (unidadesPorPaquete === null) {
    throw new Error(`"${producto.nombre}" está marcado para vender solo por paquete, pero no tiene unidades por paquete definidas`);
  }

  // 1. Grupo de Precio Especial — siempre por paquete cerrado, nunca suelto
  if (categoriaGrupoEspecial) {
    if (!esPaqueteCompleto) {
      throw new Error(
        `"${producto.nombre}" para este cliente se vende solo por paquete cerrado de ${unidadesPorPaquete} unidades`,
      );
    }
    return {
      precioUnitario: precioPorPaquete(precio, categoriaGrupoEspecial, unidadesPorPaquete, cantidad),
      categoriaUsada: categoriaGrupoEspecial,
    };
  }

  const categoriaCliente = categoriaEfectivaDelCliente(rolCliente, producto.tipoProducto);

  // 2. La sucursal solo vende suelto: siempre precio de pieza suelta, sin importar la cantidad
  if (modalidadVentaEfectiva === 'PIEZA') {
    if (precio.precioPiezaSuelta === null) {
      throw new Error(`"${producto.nombre}" no tiene definido un precio de pieza suelta`);
    }
    return { precioUnitario: precio.precioPiezaSuelta, categoriaUsada: 'PIEZA_SUELTA' };
  }

  // 3. La sucursal solo vende por paquete cerrado
  if (modalidadVentaEfectiva === 'PAQUETE') {
    if (!esPaqueteCompleto) {
      throw new Error(
        `"${producto.nombre}" en esta sucursal solo se vende por paquete completo de ${unidadesPorPaquete} unidades`,
      );
    }
    return {
      precioUnitario: precioPorPaquete(precio, categoriaCliente, unidadesPorPaquete, cantidad),
      categoriaUsada: categoriaCliente,
    };
  }

  // 4. La sucursal vende ambos: paquete completo si calza exacto, si no, pieza suelta
  if (esPaqueteCompleto) {
    return {
      precioUnitario: precioPorPaquete(precio, categoriaCliente, unidadesPorPaquete, cantidad),
      categoriaUsada: categoriaCliente,
    };
  }

  if (precio.precioPiezaSuelta === null) {
    throw new Error(`"${producto.nombre}" no tiene definido un precio de pieza suelta`);
  }
  return { precioUnitario: precio.precioPiezaSuelta, categoriaUsada: 'PIEZA_SUELTA' };
}
