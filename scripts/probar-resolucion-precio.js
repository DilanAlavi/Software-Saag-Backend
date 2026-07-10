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
const discoFlap = { nombre: 'Disco Flap 4.5"', tipoProducto: 'FERRETERIA', unidadesPorPaquete: 10, ventaSoloPorPaquete: true };
const precioDisco = {
  precioCosto: 6, menor1: 9, menor2: 8.5, mayor1: 7.5, mayor2: 7,
  plomeria: 8, carpinteria: 8, electricista: 8,
  precioPiezaSuelta: 1.0,
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
const cinta = { nombre: 'Cinta de goteo', tipoProducto: 'PLOMERIA', unidadesPorPaquete: null, ventaSoloPorPaquete: false };
const precioCinta = {
  precioCosto: 60, menor1: 90, menor2: 85, mayor1: 75, mayor2: 70,
  plomeria: 80, carpinteria: 90, electricista: 90,
  precioPiezaSuelta: null, cantidadMinimaDescuentoMenor1: null, precioDescuentoMenor1: null,
};
r = resolverPrecioLinea({
  producto: cinta, precio: precioCinta, rolCliente: 'STANDARD_1',
  modalidadVentaEfectiva: 'PIEZA', categoriaGrupoEspecial: 'MAYOR_2', cantidad: 3,
});
check('Cliente Standard1 con grupo especial Mayor2 en Cintas = precio Mayor2 (70)', r.precioUnitario === 70, r);

// Caso 7: mismo cliente comprando OTRO producto sin grupo especial = su precio normal Standard1
const martillo = { nombre: 'Martillo', tipoProducto: 'FERRETERIA', unidadesPorPaquete: null, ventaSoloPorPaquete: false };
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

console.log(`\n${fallas === 0 ? 'TODO OK' : `${fallas} FALLA(S) ENCONTRADA(S)`}`);
process.exit(fallas === 0 ? 0 : 1);
