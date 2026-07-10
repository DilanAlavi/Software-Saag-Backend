export interface DesgloseEmpaquetado {
  cajas: number | null;
  paquetes: number | null;
  piezasSueltas: number | null;
}

export function calcularDesglose(
  cantidad: number | null,
  unidadesPorCaja: number | null,
  unidadesPorPaquete: number | null,
): DesgloseEmpaquetado {
  if (cantidad === null || cantidad === undefined) {
    return { cajas: null, paquetes: null, piezasSueltas: null };
  }

  let resto = cantidad;
  let cajas: number | null = null;

  if (unidadesPorCaja && unidadesPorCaja > 0) {
    cajas = Math.floor(resto / unidadesPorCaja);
    resto = resto % unidadesPorCaja;
  }

  let paquetes: number | null = null;
  let piezasSueltas = resto;

  if (unidadesPorPaquete && unidadesPorPaquete > 0) {
    paquetes = Math.floor(resto / unidadesPorPaquete);
    piezasSueltas = resto % unidadesPorPaquete;
  }

  return { cajas, paquetes, piezasSueltas };
}
