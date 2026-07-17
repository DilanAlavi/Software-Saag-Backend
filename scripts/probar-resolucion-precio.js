const { resolverPrecioLinea } = require('../dist/domain/venta/resolucion-precio');

let fallas = 0;
function check(nombre, cond, detalle) {
  if (cond) {
    console.log(`OK   - ${nombre}`);
  } else {
    fallas++;
    console.log(`FAIL - ${nombre} ${detalle ? '=> ' + JSON.stringify(detalle) : ''}`);
  }
}

// Producto Disco Flap: paquete de 10, precio de categoría = precio del PAQUETE (ventaSoloPorPaquete=true)
const discoFlap = { nombre: 'Disco Flap 4.5"', tipoProducto: 'FERRETERIA', unidadesPorPaquete: 10, unidadesPorCaja: null, ventaSoloPorPaquete: true, unidadVentaTamano: null };
const precioDisco = {
  precioCosto: 6, menor1: 9, menor2: 8.5, mayor1: 7.5, mayor2: 7,
  plomeria: 8, carpinteria: 8, electricista: 8,
  precioCaja: null, precioPiezaSuelta: 1.0,
  cantidadMinimaDescuentoMenor1: null, precioDescuentoMenor1: null,
};

// Caso 1: Central (PAQUETE-only), cliente Standard1, compra 10 (paquete completo)
let r = resolverPrecioLinea({
  producto: discoFlap, precio: precioDisco, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PAQUETE', categoriaGrupoEspecial: null, cantidad: 10,
});
check('Central paquete completo (10u) = precio de paquete (9) repartido, 0.9 por unidad', r.precioUnitario === 0.9, r);

// Caso 2: Central (PAQUETE-only), compra 5 (no es paquete completo) -> debe fallar
let error1 = null;
try {
  resolverPrecioLinea({
    producto: discoFlap, precio: precioDisco, rolCliente: 'STANDARD_1',
    modalidadVentaEfectiva: 'PAQUETE', categoriaGrupoEspecial: null, cantidad: 5,
  });
} catch (e) { error1 = e; }
check('Central rechaza venta de 5u (no es paquete completo)', error1 !== null, error1?.message);

// Caso 3: Sucursal Norte (PIEZA), compra 5 sueltas -> usa precioPiezaSuelta (1.00)
r = resolverPrecioLinea({
  producto: discoFlap, precio: precioDisco, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 5,
});
check('Sucursal Norte (PIEZA) 5 sueltas = precio pieza suelta (1.00)', r.precioUnitario === 1, r);

// Caso 4: Sucursal Sur (AMBOS), compra 10 exactas -> precio de paquete (Standard1=9)
r = resolverPrecioLinea({
  producto: discoFlap, precio: precioDisco, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 10,
});
check('Sucursal AMBOS con 10u exactas = precio paquete (9) repartido, 0.9 por unidad', r.precioUnitario === 0.9, r);

// Caso 5: Sucursal Sur (AMBOS), compra 7 (no exacto) -> precio pieza suelta
r = resolverPrecioLinea({
  producto: discoFlap, precio: precioDisco, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 7,
});
check('Sucursal AMBOS con 7u (no exacto) = precio pieza suelta (1.00)', r.precioUnitario === 1, r);

// Caso 6: Grupo de Precio Especial (Mayor2) sobre producto de Cintas (sin paquete)
const cinta = { nombre: 'Cinta de goteo', tipoProducto: 'PLOMERIA', unidadesPorPaquete: null, unidadesPorCaja: null, ventaSoloPorPaquete: false, unidadVentaTamano: null };
const precioCinta = {
  precioCosto: 60, menor1: 90, menor2: 85, mayor1: 75, mayor2: 70,
  plomeria: 80, carpinteria: 90, electricista: 90,
  precioCaja: null, precioPiezaSuelta: null, cantidadMinimaDescuentoMenor1: null, precioDescuentoMenor1: null,
};
r = resolverPrecioLinea({
  producto: cinta, precio: precioCinta, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: 'MAYOR_2', cantidad: 3,
});
check('Cliente Standard1 con grupo especial Mayor2 en Cintas = precio Mayor2 (70)', r.precioUnitario === 70, r);

// Caso 7: mismo cliente comprando OTRO producto sin grupo especial = su precio normal Standard1
const martillo = { nombre: 'Martillo', tipoProducto: 'FERRETERIA', unidadesPorPaquete: null, unidadesPorCaja: 20, ventaSoloPorPaquete: false, unidadVentaTamano: null };
const precioMartillo = {
  precioCosto: 45.5, menor1: 65, menor2: 60, mayor1: 55, mayor2: 52,
  plomeria: 58, carpinteria: 58, electricista: 58,
  precioCaja: 50, precioPiezaSuelta: null,
  cantidadMinimaDescuentoMenor1: 10, precioDescuentoMenor1: 62,
};
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 3,
});
check('Mismo cliente en Martillo (sin grupo) = precio normal Standard1 (65)', r.precioUnitario === 65, r);

// Caso 8: descuento por volumen Standard1 (10+ unidades) en Martillo
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 10,
});
check('Standard1 comprando 10+ Martillos = precio con descuento (62)', r.precioUnitario === 62, r);

// Caso 9: Plomero comprando producto de Plomería = precio Plomería
r = resolverPrecioLinea({
  producto: cinta, precio: precioCinta, rolCliente: 'PLOMERIA',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 2,
});
check('Plomero comprando Cinta (rubro Plomería) = precio Plomería (80)', r.precioUnitario === 80, r);

// Caso 10: Plomero comprando Martillo (fuera de su rubro) = cae a Standard2
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'PLOMERIA',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 2,
});
check('Plomero comprando Martillo (fuera de su rubro) = cae a Standard2 (60)', r.precioUnitario === 60 && r.categoriaUsada === 'STANDARD_2', r);

// Caso 11: Mayor1 no tiene restricción de rubro, compra cualquier cosa a su precio
r = resolverPrecioLinea({
  producto: cinta, precio: precioCinta, rolCliente: 'MAYOR_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 2,
});
check('Mayor1 sin restricción de rubro en Cinta = precio Mayor1 (75)', r.precioUnitario === 75, r);

// Caso 12: cliente no registrado (null) = Standard1 por defecto
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: null,
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 1,
});
check('Cliente no registrado = precio Standard1 por defecto (65)', r.precioUnitario === 65, r);

// ---------- Casos nuevos: división proporcional por docena con redondeo comercial ----------
// Aldaba: paquete/docena de 12, Mayor1 = 25 (precio de la docena), SIN precio pieza suelta cargado
const aldaba = { nombre: 'Aldaba galvanizada', tipoProducto: 'FERRETERIA', unidadesPorPaquete: 12, unidadesPorCaja: null, ventaSoloPorPaquete: true, unidadVentaTamano: null };
const precioAldaba = {
  precioCosto: 10, menor1: 30, menor2: 28, mayor1: 25, mayor2: 24,
  plomeria: 26, carpinteria: 26, electricista: 26,
  precioCaja: null, precioPiezaSuelta: null, cantidadMinimaDescuentoMenor1: null, precioDescuentoMenor1: null,
};

// 3 piezas: 25/12*3 = 6.25 -> decimal .25 < .50 -> se deja tal cual (6.25 total, 2.0833.. por unidad)
r = resolverPrecioLinea({
  producto: aldaba, precio: precioAldaba, rolCliente: 'MAYOR_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 3,
});
check(
  'Aldaba 3u sin precio suelto: 25/12*3=6.25 (decimal<.50, no redondea)',
  Math.abs(r.precioUnitario * 3 - 6.25) < 0.0001,
  r,
);

// 6 piezas: 25/12*6 = 12.5 -> decimal .50 -> redondea para arriba a 13 (2.1666.. por unidad)
r = resolverPrecioLinea({
  producto: aldaba, precio: precioAldaba, rolCliente: 'MAYOR_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 6,
});
check(
  'Aldaba 6u sin precio suelto: 25/12*6=12.5 (decimal=.50, redondea a 13)',
  Math.abs(r.precioUnitario * 6 - 13) < 0.0001,
  r,
);

// 9 piezas: 25/12*9 = 18.75 -> decimal .75 -> redondea para arriba a 19
r = resolverPrecioLinea({
  producto: aldaba, precio: precioAldaba, rolCliente: 'MAYOR_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 9,
});
check(
  'Aldaba 9u sin precio suelto: 25/12*9=18.75 (decimal=.75, redondea a 19)',
  Math.abs(r.precioUnitario * 9 - 19) < 0.0001,
  r,
);

// Sucursal AMBOS, sin precio suelto cargado, cantidad no exacta (5) -> mismo cálculo proporcional
r = resolverPrecioLinea({
  producto: aldaba, precio: precioAldaba, rolCliente: 'MAYOR_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 5,
});
// 25/12*5 = 10.4166.. -> decimal .4166 < .50 -> se deja tal cual
check(
  'Aldaba AMBOS 5u (no exacto) sin precio suelto: se calcula proporcional igual (no revienta)',
  Math.abs(r.precioUnitario * 5 - 25 / 12 * 5) < 0.0001,
  r,
);

// Sucursal PAQUETE (solo paquete cerrado): 5u sigue rechazando, sin importar si hay precio suelto o no
let errorPaquete = null;
try {
  resolverPrecioLinea({
    producto: aldaba, precio: precioAldaba, rolCliente: 'MAYOR_1',
    modalidadVentaEfectiva: 'PAQUETE', categoriaGrupoEspecial: null, cantidad: 5,
  });
} catch (e) { errorPaquete = e; }
check('Aldaba en sucursal PAQUETE sigue rechazando cantidad no exacta (5u)', errorPaquete !== null, errorPaquete?.message);

// ---------- Casos nuevos: precio de caja (Mayor1/Mayor2/Carpintero/Plomero/Electricista) ----------
// Martillo: unidadesPorCaja=20, precioCaja=50, mayor2 normal=52

// Caso 13: Mayor2 comprando 19 (menos de la caja) = precio Mayor2 normal (52), NO precio caja
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'MAYOR_2',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 19,
});
check('Mayor2 con 19u (menos de la caja de 20) = precio Mayor2 normal (52)', r.precioUnitario === 52, r);

// Caso 14: Mayor2 comprando 20 (llega a la caja) = precio de caja (50)
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'MAYOR_2',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 20,
});
check('Mayor2 con 20u (llega a la caja) = precio de caja (50)', r.precioUnitario === 50, r);

// Caso 15: Mayor2 comprando 45 (más de una caja) = precio de caja igual
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'MAYOR_2',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 45,
});
check('Mayor2 con 45u (más de una caja) = precio de caja (50)', r.precioUnitario === 50, r);

// Caso 16: Grupo de Precio Especial (Mayor2) con solo 3 unidades = precio de caja igual (bypasea cantidad)
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: 'MAYOR_2', cantidad: 3,
});
check('Grupo especial Mayor2 con solo 3u = precio de caja (50), sin importar cantidad', r.precioUnitario === 50, r);

// Caso 17: Standard1 con 20 unidades (llega a la "caja") NO debe tomar precio de caja, sigue su propio mecanismo
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 20,
});
check('Standard1 con 20u = su propio descuento por cantidad mínima (62), no precio de caja', r.precioUnitario === 62, r);

// Caso 18: Standard2 con 20 unidades (llega a la "caja") NO debe tomar precio de caja, nunca participa
const precioMartilloConS2 = { ...precioMartillo };
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartilloConS2, rolCliente: 'PLOMERIA', // fuera de rubro -> cae a Standard2
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 20,
});
check('Standard2 (plomero fuera de rubro) con 20u = precio Standard2 normal (60), nunca precio de caja', r.precioUnitario === 60, r);

// Caso 19: producto sin precioCaja cargado (Cinta) - Mayor2 con cantidad alta sigue su precio normal
r = resolverPrecioLinea({
  producto: cinta, precio: precioCinta, rolCliente: 'MAYOR_2',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 500,
});
check('Producto sin precioCaja: Mayor2 con cantidad alta sigue con su precio normal (70)', r.precioUnitario === 70, r);

// ---------- Casos nuevos: unidad de venta "par" (bisagra dorada FERRAWY) ----------
// Paquete comercial = 24 piezas (12 pares). Unidad de venta = par (2 piezas).
// Menor1=115 (precio de 1 paquete completo), precioPiezaSuelta=22 (precio suelto por par),
// Carpinteria=9 (precio plano por par, siempre).
const bisagraDorada = {
  nombre: 'Bisagra 4" dorado', tipoProducto: 'CARPINTERIA',
  unidadesPorPaquete: 24, unidadesPorCaja: 72, ventaSoloPorPaquete: true, unidadVentaTamano: 2,
};
const precioBisagraDorada = {
  precioCosto: 100, menor1: 115, menor2: 115, mayor1: 105, mayor2: 105,
  plomeria: 9, carpinteria: 9, electricista: 9,
  precioCaja: null, precioPiezaSuelta: 22,
  cantidadMinimaDescuentoMenor1: null, precioDescuentoMenor1: null,
};

// Caso 20: Carpintero comprando 2 piezas (1 par) = precio plano por par (9), sin importar nada
r = resolverPrecioLinea({
  producto: bisagraDorada, precio: precioBisagraDorada, rolCliente: 'CARPINTERIA',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 2,
});
check('Carpintero 1 par (2 piezas) = precio plano por par (9)', r.precioUnitario * 2 === 9, r);

// Caso 21: Carpintero comprando 48 piezas (24 pares, o sea 2 paquetes) = SIGUE precio plano por par (9)
r = resolverPrecioLinea({
  producto: bisagraDorada, precio: precioBisagraDorada, rolCliente: 'CARPINTERIA',
  modalidadVentaEfectiva: 'PAQUETE', categoriaGrupoEspecial: null, cantidad: 48,
});
check('Carpintero 24 pares (48 piezas), sucursal PAQUETE-only = igual precio plano por par (9), sin excepcion', r.precioUnitario * 2 === 9, r);

// Caso 22: Standard1 (random) pide 10 piezas (5 pares, menos de 1 paquete=24) = precio suelto por par (22)
r = resolverPrecioLinea({
  producto: bisagraDorada, precio: precioBisagraDorada, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 10,
});
check('Standard1 5 pares (10 piezas, menos de 1 paquete) = precio suelto por par (22)', Math.abs(r.precioUnitario * 2 - 22) < 0.0001, r);

// Caso 23: Standard1 pide 40 piezas (20 pares, mas de 1 paquete de 24 pero NO exacto) = UN SOLO precio Menor1, sin mezclar
r = resolverPrecioLinea({
  producto: bisagraDorada, precio: precioBisagraDorada, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 40,
});
// 40 piezas >= 24 (1 paquete) -> precio Menor1 (115) proporcional: 115/24 por pieza
check('Standard1 20 pares (40 piezas, pasa de 1 paquete, no exacto) = un solo precio Menor1 (115/24 por pieza)', Math.abs(r.precioUnitario - 115 / 24) < 0.0001, r);

// Caso 24: Standard1 pide exactamente 24 piezas (1 paquete exacto) = precio Menor1 normal (ya funcionaba)
r = resolverPrecioLinea({
  producto: bisagraDorada, precio: precioBisagraDorada, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 24,
});
check('Standard1 exactamente 1 paquete (24 piezas) = precio Menor1 (115/24 por pieza)', Math.abs(r.precioUnitario - 115 / 24) < 0.0001, r);

// Caso 25: Mayorista (Mayor1) comprando caja cerrada exacta (72 piezas = 3 paquetes) = precio Mayor1 normal
r = resolverPrecioLinea({
  producto: bisagraDorada, precio: precioBisagraDorada, rolCliente: 'MAYOR_1',
  modalidadVentaEfectiva: 'AMBOS', categoriaGrupoEspecial: null, cantidad: 72,
});
check('Mayorista 72 piezas (3 paquetes exactos) = precio Mayor1 (105/24 por pieza)', Math.abs(r.precioUnitario - 105 / 24) < 0.0001, r);

// Caso 26: Carpintero en sucursal donde el producto NO tiene unidadVentaTamano (ej. Martillo) = sigue el comportamiento de siempre (sin cambios)
r = resolverPrecioLinea({
  producto: martillo, precio: precioMartillo, rolCliente: 'CARPINTERIA',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: null, cantidad: 3,
});
check('Producto sin unidadVentaTamano: Carpintero sigue el comportamiento anterior (Carpinteria=58, fuera de rubro FERRETERIA cae a Standard2=60)', r.precioUnitario === 60, r);

console.log(`\n${fallas === 0 ? 'TODO OK' : `${fallas} FALLA(S) ENCONTRADA(S)`}`);
process.exit(fallas === 0 ? 0 : 1);
