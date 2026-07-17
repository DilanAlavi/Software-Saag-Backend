export interface ProductoParaPrecio {
  nombre: string;
  tipoProducto: string;
  unidadesPorPaquete: number | null;
  unidadesPorCaja: number | null;
  /** Si es true, los precios de categoría representan el precio del PAQUETE, no de la pieza. */
  ventaSoloPorPaquete: boolean;
  /**
   * Cuántas piezas hace 1 unidad de venta (ej. 2 para "par"). Cuando está presente, activa
   * la lógica de precio por unidad de venta: los roles de oficio (Carpintero/Plomero/
   * Electricista) siempre pagan un precio plano por esa unidad, y Standard/Mayor pasan a un
   * único precio de paquete completo en cuanto la cantidad llega a la de un paquete.
   */
  unidadVentaTamano: number | null;
  /**
   * Si es true, cualquier división/proporción de precio en este producto SIEMPRE redondea
   * hacia arriba al boliviano entero (sin dejar centavos), sin importar qué tan chico sea el
   * decimal. Es distinto del redondeo comercial normal (que solo sube a partir de 0.50).
   */
  redondeoSiempreArriba: boolean;
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
  precioCaja: number | null;
  precioPiezaSuelta: number | null;
  cantidadMinimaDescuentoMenor1: number | null;
  precioDescuentoMenor1: number | null;
}

/**
 * Categorías que pueden acceder al "precio de caja" (más barato que su precio normal de rol),
 * cuando el producto tiene ese precio cargado. Standard 1 y Standard 2 quedan afuera a propósito:
 * Standard 1 tiene su propio mecanismo de descuento por cantidad mínima (aparte), y Standard 2
 * nunca entra en precio de caja.
 */
const CATEGORIAS_CON_PRECIO_CAJA = ['MAYOR_1', 'MAYOR_2', 'CARPINTERIA', 'PLOMERIA', 'ELECTRICISTA'];

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

function precioConDescuentoVolumen(
  precio: PrecioParaResolucion,
  categoria: string,
  cantidad: number,
  unidadesPorCaja: number | null = null,
  esGrupoEspecial: boolean = false,
): number {
  const base = obtenerPrecioCategoria(precio, categoria);

  // Standard 1: descuento manual configurado aparte (cantidad mínima propia + precio propio).
  if (
    categoria === 'STANDARD_1' &&
    precio.cantidadMinimaDescuentoMenor1 !== null &&
    precio.precioDescuentoMenor1 !== null &&
    cantidad >= precio.cantidadMinimaDescuentoMenor1
  ) {
    return precio.precioDescuentoMenor1;
  }

  // Precio de caja: para Mayor1/Mayor2/Carpintero/Plomero/Electricista, si el producto tiene
  // precioCaja cargado. Un cliente de Grupo de Precio Especial lo obtiene siempre (para eso
  // existe el grupo); el resto solo si la cantidad llega a la de una caja completa.
  if (CATEGORIAS_CON_PRECIO_CAJA.includes(categoria) && precio.precioCaja !== null) {
    const llegaACaja = unidadesPorCaja !== null && cantidad >= unidadesPorCaja;
    if (esGrupoEspecial || llegaACaja) {
      return precio.precioCaja;
    }
  }

  return base;
}

/**
 * Precio por unidad de venta (ej. "par") cuando el producto tiene unidadVentaTamano definido:
 * - Carpintero/Plomero/Electricista: SIEMPRE precio plano por esa unidad (ej. por par), sin
 *   importar la cantidad ni si compran caja completa o no.
 * - El resto de roles (Standard/Mayor): en cuanto la cantidad llega a la de un paquete completo,
 *   un solo precio (el de su categoría) aplicado proporcional a toda la cantidad, sin mezclar
 *   con el precio suelto. Por debajo de esa cantidad, precio suelto por unidad de venta.
 */
function precioParaCategoriaConUnidadVenta(
  precio: PrecioParaResolucion,
  categoria: string,
  cantidad: number,
  unidadesPorPaquete: number,
  unidadVentaTamano: number,
): number {
  if (CATEGORIAS_DE_OFICIO.includes(categoria)) {
    return obtenerPrecioCategoria(precio, categoria) / unidadVentaTamano;
  }
  if (cantidad >= unidadesPorPaquete) {
    return precioConDescuentoVolumen(precio, categoria, cantidad) / unidadesPorPaquete;
  }
  if (precio.precioPiezaSuelta !== null) {
    return precio.precioPiezaSuelta / unidadVentaTamano;
  }
  return precioProporcionalConRedondeo(precio, categoria, unidadesPorPaquete, cantidad);
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
  redondeoSiempreArriba: boolean = false,
): number {
  const totalPaquetes = cantidad / unidadesPorPaquete;
  const precioCategoria = precioConDescuentoVolumen(precio, categoria, cantidad);
  const totalSinRedondear = precioCategoria * totalPaquetes;
  const total = redondeoSiempreArriba ? redondearSiempreArriba(totalSinRedondear) : totalSinRedondear;
  return total / cantidad;
}

/**
 * Redondeo comercial: si los centavos dan 0.50 o más, sube al boliviano completo.
 * Si dan menos de 0.50, se deja el valor tal cual (con centavos, sin redondear).
 */
function redondeoComercial(valorTotal: number): number {
  const entero = Math.floor(valorTotal);
  const decimal = valorTotal - entero;
  return decimal >= 0.5 ? entero + 1 : valorTotal;
}

/**
 * Redondeo "siempre arriba": para productos donde no se quiere dejar NINGÚN centavo, sin
 * importar qué tan chico sea el decimal (a diferencia del redondeo comercial, que solo
 * sube a partir de 0.50). Ej. 13.33 -> 14, 17.50 -> 18, 35.00 -> 35 (ya es entero, no cambia).
 */
function redondearSiempreArriba(valorTotal: number): number {
  const redondeado = Math.round(valorTotal * 100) / 100; // limpia ruido de punto flotante
  return Number.isInteger(redondeado) ? redondeado : Math.ceil(redondeado);
}

/**
 * Cuando se vende una cantidad parcial de un producto por paquete/docena y NO hay un
 * "precio pieza suelta" fijo cargado, se divide proporcionalmente el precio del paquete
 * completo entre las unidades pedidas, aplicando el redondeo (comercial o siempre-arriba,
 * según el producto) sobre el total.
 */
function precioProporcionalConRedondeo(
  precio: PrecioParaResolucion,
  categoria: string,
  unidadesPorPaquete: number,
  cantidad: number,
  redondeoSiempreArriba: boolean = false,
): number {
  const precioCategoria = precioConDescuentoVolumen(precio, categoria, cantidad);
  const totalSinRedondear = (precioCategoria / unidadesPorPaquete) * cantidad;
  const totalRedondeado = redondeoSiempreArriba ? redondearSiempreArriba(totalSinRedondear) : redondeoComercial(totalSinRedondear);
  return totalRedondeado / cantidad;
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
        precioUnitario: precioConDescuentoVolumen(precio, categoriaGrupoEspecial, cantidad, producto.unidadesPorCaja, true),
        categoriaUsada: categoriaGrupoEspecial,
      };
    }
    const categoriaCliente = categoriaEfectivaDelCliente(rolCliente, producto.tipoProducto);
    return {
      precioUnitario: precioConDescuentoVolumen(precio, categoriaCliente, cantidad, producto.unidadesPorCaja, false),
      categoriaUsada: categoriaCliente,
    };
  }

  // A partir de aquí: producto.ventaSoloPorPaquete === true -> los precios de categoría son POR PAQUETE.
  if (unidadesPorPaquete === null) {
    throw new Error(`"${producto.nombre}" está marcado para vender solo por paquete, pero no tiene unidades por paquete definidas`);
  }

  // Productos con "redondeoSiempreArriba" (ej. Grasa, se vende de 3 en 3): ignoran por completo
  // la modalidad de venta de la sucursal (PIEZA/PAQUETE/AMBOS) — nunca exigen el paquete
  // completo, siempre calculan proporcional a la cantidad exacta pedida, redondeando arriba.
  if (producto.redondeoSiempreArriba) {
    const categoria = categoriaGrupoEspecial ?? categoriaEfectivaDelCliente(rolCliente, producto.tipoProducto);
    if (esPaqueteCompleto) {
      return {
        precioUnitario: precioPorPaquete(precio, categoria, unidadesPorPaquete, cantidad, true),
        categoriaUsada: categoria,
      };
    }
    return {
      precioUnitario: precioProporcionalConRedondeo(precio, categoria, unidadesPorPaquete, cantidad, true),
      categoriaUsada: categoria,
    };
  }

  // 1. Grupo de Precio Especial — siempre por paquete cerrado, nunca suelto
  if (categoriaGrupoEspecial) {
    if (!esPaqueteCompleto) {
      throw new Error(
        `"${producto.nombre}" para este cliente se vende solo por paquete cerrado de ${unidadesPorPaquete} unidades`,
      );
    }
    return {
      precioUnitario: precioPorPaquete(precio, categoriaGrupoEspecial, unidadesPorPaquete, cantidad, producto.redondeoSiempreArriba),
      categoriaUsada: categoriaGrupoEspecial,
    };
  }

  const categoriaCliente = categoriaEfectivaDelCliente(rolCliente, producto.tipoProducto);
  const unidadVentaTamano = producto.unidadVentaTamano;

  // Roles de oficio en un producto con unidad de venta (ej. "par"): precio plano siempre,
  // sin importar sucursal ni cantidad. Se resuelve antes de cualquier chequeo de paquete/caja.
  // Excepción: si el producto tiene precioCaja cargado y la cantidad llega a la de una caja
  // completa, ese precio (más barato) manda por encima del plano normal.
  if (unidadVentaTamano !== null && CATEGORIAS_DE_OFICIO.includes(categoriaCliente)) {
    if (precio.precioCaja !== null && producto.unidadesPorCaja !== null && cantidad >= producto.unidadesPorCaja) {
      return { precioUnitario: precio.precioCaja / unidadVentaTamano, categoriaUsada: categoriaCliente };
    }
    return {
      precioUnitario: obtenerPrecioCategoria(precio, categoriaCliente) / unidadVentaTamano,
      categoriaUsada: categoriaCliente,
    };
  }

  // 2. La sucursal solo vende suelto: precio de pieza suelta si está fijado; si no, se divide
  // proporcionalmente el precio del paquete con el redondeo comercial.
  if (modalidadVentaEfectiva === 'PIEZA') {
    if (unidadVentaTamano !== null) {
      return {
        precioUnitario: precioParaCategoriaConUnidadVenta(precio, categoriaCliente, cantidad, unidadesPorPaquete, unidadVentaTamano),
        categoriaUsada: categoriaCliente,
      };
    }
    if (precio.precioPiezaSuelta !== null) {
      return { precioUnitario: precio.precioPiezaSuelta, categoriaUsada: 'PIEZA_SUELTA' };
    }
    return {
      precioUnitario: precioProporcionalConRedondeo(precio, categoriaCliente, unidadesPorPaquete, cantidad, producto.redondeoSiempreArriba),
      categoriaUsada: categoriaCliente,
    };
  }

  // 3. La sucursal solo vende por paquete cerrado
  if (modalidadVentaEfectiva === 'PAQUETE') {
    if (!esPaqueteCompleto) {
      throw new Error(
        `"${producto.nombre}" en esta sucursal solo se vende por paquete completo de ${unidadesPorPaquete} unidades`,
      );
    }
    return {
      precioUnitario: precioPorPaquete(precio, categoriaCliente, unidadesPorPaquete, cantidad, producto.redondeoSiempreArriba),
      categoriaUsada: categoriaCliente,
    };
  }

  // 4. La sucursal vende ambos: paquete completo si calza exacto, si no, pieza suelta
  if (esPaqueteCompleto) {
    return {
      precioUnitario: precioPorPaquete(precio, categoriaCliente, unidadesPorPaquete, cantidad, producto.redondeoSiempreArriba),
      categoriaUsada: categoriaCliente,
    };
  }

  if (unidadVentaTamano !== null) {
    return {
      precioUnitario: precioParaCategoriaConUnidadVenta(precio, categoriaCliente, cantidad, unidadesPorPaquete, unidadVentaTamano),
      categoriaUsada: categoriaCliente,
    };
  }

  if (precio.precioPiezaSuelta !== null) {
    return { precioUnitario: precio.precioPiezaSuelta, categoriaUsada: 'PIEZA_SUELTA' };
  }
  return {
    precioUnitario: precioProporcionalConRedondeo(precio, categoriaCliente, unidadesPorPaquete, cantidad, producto.redondeoSiempreArriba),
    categoriaUsada: categoriaCliente,
  };
}
