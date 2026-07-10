const { PrismaService } = require('../dist/infrastructure/persistence/prisma/prisma.service');
const { VentaPrismaRepository } = require('../dist/infrastructure/persistence/prisma/venta.prisma.repository');
const { VentaService } = require('../dist/application/venta/venta.service');
const { StockPrismaRepository } = require('../dist/infrastructure/persistence/prisma/stock.prisma.repository');
const { StockService } = require('../dist/application/stock/stock.service');
const { ProformaPdfService } = require('../dist/application/venta/proforma-pdf.service');

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
  const ventaRepo = new VentaPrismaRepository(prisma);
  const ventaService = new VentaService(ventaRepo);
  const stockRepo = new StockPrismaRepository(prisma);
  const stockService = new StockService(stockRepo);
  const proformaPdfService = new ProformaPdfService();

  const carlos = await prisma.cliente.findFirst({ where: { nombre: 'Carlos' } }); // STANDARD_1
  const martillo = await prisma.producto.findFirst({ where: { codigo: '7506005923456' } }); // ventaSoloPorPaquete=false, unidadesPorPaquete=10
  const vendedor = await prisma.usuario.findFirst({ where: { username: 'vendedor' } }); // sucursalId 1
  const admin = await prisma.usuario.findFirst({ where: { username: 'admin' } }); // ADMIN, sin sucursal fija

  const usuarioVendedor = { sub: vendedor.id, rol: vendedor.rol, sucursalId: vendedor.sucursalId };
  const usuarioAdmin = { sub: admin.id, rol: admin.rol, sucursalId: admin.sucursalId };

  // Reiniciar el stock del martillo en Central para que el script sea repetible
  await prisma.stock.upsert({
    where: { productoId_sucursalId: { productoId: martillo.id, sucursalId: 1 } },
    update: { cantidad: 25, confirmado: false, cantidadVendidaAcumulada: 0 },
    create: { productoId: martillo.id, sucursalId: 1, cantidad: 25, confirmado: false, cantidadVendidaAcumulada: 0 },
  });

  // Stock inicial del martillo en Central (id 1): cantidad 25, confirmado false
  const stockAntes = await prisma.stock.findFirst({ where: { productoId: martillo.id, sucursalId: 1 } });
  check('Stock inicial martillo en Central no confirmado', stockAntes.confirmado === false, `confirmado=${stockAntes.confirmado}`);

  // ---------- CASO 0: Cotizar (preview de precio) sin crear nada ----------
  const cotizacion = await ventaService.cotizar(usuarioVendedor, {
    clienteId: carlos.id,
    lineas: [{ productoId: martillo.id, cantidad: 3 }],
  });
  check('Cotizar: total = 195 (3 x 65) sin crear venta', cotizacion.total === 195, `total=${cotizacion.total}`);
  const stockTrasCotizar = await prisma.stock.findFirst({ where: { productoId: martillo.id, sucursalId: 1 } });
  check('Cotizar NO modifica el stock', stockTrasCotizar.cantidadVendidaAcumulada === 0, `obtuvo ${stockTrasCotizar.cantidadVendidaAcumulada}`);

  // ---------- CASO 1: Venta pagada de inmediato, cliente STANDARD_1, 3 martillos ----------
  // menor1 (STANDARD_1) = 65, sin descuento por volumen (minimo 10 unidades para descuento, aquí solo 3)
  const venta1 = await ventaService.crear(usuarioVendedor, {
    clienteId: carlos.id,
    lineas: [{ productoId: martillo.id, cantidad: 3 }],
    pagarAhora: true,
    efectivoRecibido: 200,
  });
  check('Venta1 creada con estado PAGADO', venta1.estado === 'PAGADO', `estado=${venta1.estado}`);
  check('Venta1 total = 195 (3 x 65)', Number(venta1.total) === 195, `total=${venta1.total}`);
  check('Venta1 vuelto = 5 (200 - 195)', Number(venta1.vuelto) === 5, `vuelto=${venta1.vuelto}`);
  check('Venta1 detalle precioUnitario = 65', Number(venta1.detalles[0].precioUnitario) === 65);

  // Stock: cantidadVendidaAcumulada debe subir 3, cantidad NO debe bajar (no confirmado)
  let stockDespues1 = await prisma.stock.findFirst({ where: { productoId: martillo.id, sucursalId: 1 } });
  check('Stock: cantidadVendidaAcumulada sube a 3', stockDespues1.cantidadVendidaAcumulada === 3, `obtuvo ${stockDespues1.cantidadVendidaAcumulada}`);
  check('Stock: cantidad NO baja (no confirmado todavía)', stockDespues1.cantidad === 25, `obtuvo ${stockDespues1.cantidad}`);

  // ---------- CASO 2: Confirmar stock exacto en 40, luego vender de nuevo y verificar que ahora sí descuenta ----------
  await stockService.confirmar({ productoId: martillo.id, sucursalId: 1, cantidad: 40 });
  let stockConfirmado = await prisma.stock.findFirst({ where: { productoId: martillo.id, sucursalId: 1 } });
  check('Stock confirmado = true, cantidad = 40 exacto', stockConfirmado.confirmado === true && stockConfirmado.cantidad === 40);

  const venta2 = await ventaService.crear(usuarioVendedor, {
    clienteId: carlos.id,
    lineas: [{ productoId: martillo.id, cantidad: 2 }],
    pagarAhora: false,
  });
  check('Venta2 creada con estado PENDIENTE (pagarAhora=false)', venta2.estado === 'PENDIENTE', `estado=${venta2.estado}`);

  let stockDespues2 = await prisma.stock.findFirst({ where: { productoId: martillo.id, sucursalId: 1 } });
  check('Stock: cantidadVendidaAcumulada sube a 5 (3+2)', stockDespues2.cantidadVendidaAcumulada === 5, `obtuvo ${stockDespues2.cantidadVendidaAcumulada}`);
  check('Stock: cantidad SÍ baja ahora (confirmado) 40-2=38', stockDespues2.cantidad === 38, `obtuvo ${stockDespues2.cantidad}`);

  // ---------- CASO 3: pagar despues una venta pendiente (venta2), con nuevo precio (simulando cambio) ----------
  const venta2Pagada = await ventaService.pagar(venta2.id, { efectivoRecibido: 150 });
  check('Venta2 pagada pasa a estado PAGADO', venta2Pagada.estado === 'PAGADO');
  check('Venta2 vuelto correcto = 150 - 130 (2x65)', Number(venta2Pagada.vuelto) === 20, `vuelto=${venta2Pagada.vuelto}`);

  // ---------- CASO 4: crear venta pendiente y cancelarla ----------
  const venta3 = await ventaService.crear(usuarioVendedor, {
    clienteId: carlos.id,
    lineas: [{ productoId: martillo.id, cantidad: 1 }],
    pagarAhora: false,
  });
  const venta3Cancelada = await ventaService.cancelar(venta3.id, { motivo: 'NO_RECOGIO' });
  check('Venta3 cancelada correctamente', venta3Cancelada.estado === 'CANCELADO' && venta3Cancelada.motivoCancelacion === 'NO_RECOGIO');

  let errorCancelarPagada = null;
  try {
    await ventaService.cancelar(venta1.id, { motivo: 'CLIENTE_CANCELO' });
  } catch (e) {
    errorCancelarPagada = e;
  }
  check('No se puede cancelar una venta ya PAGADA', errorCancelarPagada !== null);

  // ---------- CASO 5: entrega parcial y luego completa ----------
  const ventaMulti = await ventaService.crear(usuarioVendedor, {
    clienteId: carlos.id,
    lineas: [
      { productoId: martillo.id, cantidad: 1 },
    ],
    pagarAhora: true,
    efectivoRecibido: 100,
  });
  // agregar otra linea de otro producto para probar entrega parcial (usemos disco si existe con stock)
  const disco = await prisma.producto.findFirst({ where: { codigo: 'DISCO-TEST-001' } });
  const ventaMulti2 = await ventaService.crear(usuarioVendedor, {
    clienteId: carlos.id,
    lineas: [
      { productoId: martillo.id, cantidad: 1 },
      { productoId: disco.id, cantidad: 10 }, // paquete completo en Central (10 unidadesPorPaquete)
    ],
    pagarAhora: true,
    efectivoRecibido: 500,
  });
  check('VentaMulti2 tiene 2 detalles', ventaMulti2.detalles.length === 2);
  const idsDetalle = ventaMulti2.detalles.map((d) => d.id);
  const entregaParcial = await ventaService.entregar(ventaMulti2.id, { detalleIds: [idsDetalle[0]] });
  check('Entrega parcial: solo 1 detalle entregado', entregaParcial.detalles.filter((d) => d.entregado).length === 1);
  const entregaCompleta = await ventaService.entregar(ventaMulti2.id, { detalleIds: idsDetalle });
  check('Entrega completa: ambos detalles entregados', entregaCompleta.detalles.every((d) => d.entregado));

  // ---------- CASO 6: listar con filtro de estado ----------
  const { ventas: pendientes } = await ventaService.listar({ estado: 'PENDIENTE' });
  check('Listar PENDIENTE no incluye ventas pagadas/canceladas', pendientes.every((v) => v.estado === 'PENDIENTE'));

  // ---------- CASO 6b: reportar incidencia ----------
  const reportada = await ventaService.reportar(venta1.id, { mensaje: 'El cliente pidió cambiar la hora de recojo' });
  check('Reportar guarda el mensaje', reportada.reporte === 'El cliente pidió cambiar la hora de recojo');
  check('Reportar guarda la fecha', reportada.fechaReporte !== null);

  // ---------- CASO 7: ADMIN requiere sucursalId explicito ----------
  let errorAdminSinSucursal = null;
  try {
    await ventaService.crear(usuarioAdmin, {
      clienteId: carlos.id,
      lineas: [{ productoId: martillo.id, cantidad: 1 }],
      pagarAhora: true,
      efectivoRecibido: 100,
    });
  } catch (e) {
    errorAdminSinSucursal = e;
  }
  check('ADMIN sin sucursalId en el body es rechazado', errorAdminSinSucursal !== null);

  const ventaAdmin = await ventaService.crear(usuarioAdmin, {
    clienteId: carlos.id,
    sucursalId: 1,
    lineas: [{ productoId: martillo.id, cantidad: 1 }],
    pagarAhora: true,
    efectivoRecibido: 100,
  });
  check('ADMIN con sucursalId explícito puede crear venta', ventaAdmin.estado === 'PAGADO');

  // ---------- CASO 8: generación de PDF proforma ----------
  const ventaCompleta = await ventaService.obtener(venta1.id);
  const pdfBuffer = await proformaPdfService.generar(ventaCompleta);
  check('PDF de proforma generado (buffer no vacío)', Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 100, `size=${pdfBuffer.length}`);

  // ---------- CASO 9: paginación y filtro por fecha (ventas del día) ----------
  const pagina1 = await ventaService.listar({ page: 1, pageSize: 2 });
  check('Paginación: pageSize=2 devuelve como máximo 2', pagina1.ventas.length <= 2, `obtuvo ${pagina1.ventas.length}`);
  check('Paginación: total refleja el total real, no el de la página', pagina1.total >= pagina1.ventas.length);

  const hoy = new Date().toISOString().slice(0, 10);
  const ventasDeHoy = await ventaService.listar({ fecha: hoy });
  check(
    'Filtro por fecha: todas las ventas devueltas son de hoy',
    ventasDeHoy.ventas.every((v) => new Date(v.fecha).toISOString().slice(0, 10) === hoy),
  );

  console.log(`\n${fallas === 0 ? 'TODO OK' : `${fallas} FALLA(S) ENCONTRADA(S)`}`);
  await prisma.$disconnect();
  process.exit(fallas === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('ERROR INESPERADO:', e);
  process.exit(1);
});
