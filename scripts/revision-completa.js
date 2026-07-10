const { PrismaService } = require('../dist/infrastructure/persistence/prisma/prisma.service');
const { StockPrismaRepository } = require('../dist/infrastructure/persistence/prisma/stock.prisma.repository');
const { StockService } = require('../dist/application/stock/stock.service');
const {
  GrupoPrecioEspecialPrismaRepository,
} = require('../dist/infrastructure/persistence/prisma/grupo-precio-especial.prisma.repository');
const {
  GrupoPrecioEspecialService,
} = require('../dist/application/grupo-precio-especial/grupo-precio-especial.service');
const { SucursalPrismaRepository } = require('../dist/infrastructure/persistence/prisma/sucursal.prisma.repository');
const { SucursalService } = require('../dist/application/sucursal/sucursal.service');
const { PrecioPrismaRepository } = require('../dist/infrastructure/persistence/prisma/precio.prisma.repository');
const { PrecioService } = require('../dist/application/precio/precio.service');

let fallas = 0;
function check(nombre, cond, detalle) {
  if (cond) {
    console.log(`OK   - ${nombre}`);
  } else {
    fallas++;
    console.log(`FAIL - ${nombre} ${detalle ? '=> ' + detalle : ''}`);
  }
}

async function main() {
  const prisma = new PrismaService();

  // ---------- STOCK ----------
  const stockRepo = new StockPrismaRepository(prisma);
  const stockService = new StockService(stockRepo);

  const disco = await prisma.producto.findFirst({ where: { codigo: 'DISCO-TEST-001' } });
  const central = await prisma.sucursal.findFirst({ where: { nombre: 'Central' } });
  const sucursalSur = await prisma.sucursal.findFirst({ where: { nombre: 'Sucursal Sur' } });

  // Caso 1: crear stock nuevo en una ubicacion sin fila previa (Sucursal Sur), sumando cajas+piezas
  await stockService.guardar({ productoId: disco.id, sucursalId: sucursalSur.id, cajas: 1, piezas: 3 });
  let filas = await stockService.listar();
  let filaSur = filas.find((f) => f.productoId === disco.id && f.sucursalId === sucursalSur.id);
  // unidadesPorCaja del disco es 50 -> 1 caja + 3 piezas = 53 unidades
  check('Stock nuevo: 1 caja + 3 piezas = 53 unidades', filaSur.unidadesTotales === 53, `obtuvo ${filaSur.unidadesTotales}`);

  // Caso 2: agregar mas stock a la misma ubicacion (debe sumar, no sobreescribir)
  await stockService.guardar({ productoId: disco.id, sucursalId: sucursalSur.id, piezas: 10 });
  filas = await stockService.listar();
  filaSur = filas.find((f) => f.productoId === disco.id && f.sucursalId === sucursalSur.id);
  check('Stock incremental: 53 + 10 = 63 unidades', filaSur.unidadesTotales === 63, `obtuvo ${filaSur.unidadesTotales}`);

  // Caso 3: verificar desglose correcto (63 unidades, caja=50, paquete=10 -> 1 caja, 1 paquete, 3 piezas)
  check(
    'Desglose 63u (caja=50,paquete=10) = 1 caja, 1 paquete, 3 piezas',
    filaSur.cajas === 1 && filaSur.paquetes === 1 && filaSur.piezasSueltas === 3,
    `obtuvo cajas=${filaSur.cajas} paquetes=${filaSur.paquetes} piezas=${filaSur.piezasSueltas}`,
  );

  // Caso 4: area se preserva si no se vuelve a mandar
  await stockService.guardar({ productoId: disco.id, sucursalId: sucursalSur.id, area: 'Depósito trasero', piezas: 1 });
  await stockService.guardar({ productoId: disco.id, sucursalId: sucursalSur.id, piezas: 1 });
  filas = await stockService.listar();
  filaSur = filas.find((f) => f.productoId === disco.id && f.sucursalId === sucursalSur.id);
  check('Área se preserva entre actualizaciones sin mandarla de nuevo', filaSur.area === 'Depósito trasero', `obtuvo "${filaSur.area}"`);

  // ---------- GRUPO DE PRECIO ESPECIAL ----------
  const grupoRepo = new GrupoPrecioEspecialPrismaRepository(prisma);
  const grupoService = new GrupoPrecioEspecialService(grupoRepo);

  const cinta = await prisma.producto.findFirst({ where: { codigo: 'CINTA-GOTEO-001' } });
  const grupo = await prisma.grupoPrecioEspecial.findFirst({ where: { nombre: 'Cintas' } });

  let detalle = await grupoService.listar();
  const grupoCintas = detalle.find((g) => g.id === grupo.id);
  check('Grupo Cintas tiene 1 producto (Cinta de goteo)', grupoCintas.productos.length === 1);
  check('Grupo Cintas tiene 1 cliente asignado', grupoCintas.clientes.length === 1);

  // Caso: agregar el mismo producto dos veces (debe fallar por unique constraint, sin mensaje amigable todavia)
  let errorDuplicado = null;
  try {
    await grupoService.agregarProducto(grupo.id, cinta.id);
  } catch (e) {
    errorDuplicado = e;
  }
  check('Agregar producto duplicado al grupo lanza error (esperado)', errorDuplicado !== null);
  if (errorDuplicado) {
    console.log(`     mensaje real: ${errorDuplicado.message?.split('\n').pop()}`);
  }

  // ---------- SUCURSAL ----------
  const sucursalRepo = new SucursalPrismaRepository(prisma);
  const sucursalService = new SucursalService(sucursalRepo);
  const todasSucursales = await sucursalService.listar();
  const centralActualizada = todasSucursales.find((s) => s.id === central.id);
  check('Central tiene modalidadVentaPaquete = PAQUETE', centralActualizada.modalidadVentaPaquete === 'PAQUETE');

  const norte = todasSucursales.find((s) => s.nombre === 'Sucursal Norte');
  check('Sucursal Norte tiene modalidadVentaPaquete = PIEZA', norte.modalidadVentaPaquete === 'PIEZA');
  const sur = todasSucursales.find((s) => s.nombre === 'Sucursal Sur');
  check('Sucursal Sur no tiene override (null = usa default del producto)', sur.modalidadVentaPaquete === null);

  // ---------- PRECIO: validacion cruzada precioPiezaSuelta ----------
  const precioRepo = new PrecioPrismaRepository(prisma);
  const precioService = new PrecioService(precioRepo);
  let errorPiezaSuelta = null;
  try {
    precioService.guardar(disco.id, {
      precioCosto: 8,
      menor1: 12,
      menor2: 11,
      mayor1: 10,
      mayor2: 9.5,
      plomeria: 11,
      carpinteria: 11,
      electricista: 11,
      precioPiezaSuelta: 5, // menor al costo (8) -> debe rechazar
    });
  } catch (e) {
    errorPiezaSuelta = e;
  }
  check('precioPiezaSuelta menor al costo es rechazado', errorPiezaSuelta !== null);

  console.log(`\n${fallas === 0 ? 'TODO OK' : `${fallas} FALLA(S) ENCONTRADA(S)`}`);
  await prisma.$disconnect();
  process.exit(fallas === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('ERROR INESPERADO:', e);
  process.exit(1);
});
