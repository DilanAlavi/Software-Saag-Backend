const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const antes = {
    ventas: await prisma.venta.count(),
    detalleVenta: await prisma.detalleVenta.count(),
    clientes: await prisma.cliente.count(),
    productos: await prisma.producto.count(),
    precios: await prisma.precio.count(),
    stock: await prisma.stock.count(),
    grupos: await prisma.grupoPrecioEspecial.count(),
    usuarios: await prisma.usuario.count(),
    sucursales: await prisma.sucursal.count(),
  };
  console.log('ANTES:', antes);

  // Orden respetando llaves foráneas. Usuario y Sucursal NO se tocan.
  await prisma.detalleVenta.deleteMany({});
  await prisma.venta.deleteMany({});
  await prisma.clienteGrupoPrecioEspecial.deleteMany({});
  await prisma.grupoPrecioEspecialProducto.deleteMany({});
  await prisma.grupoPrecioEspecial.deleteMany({});
  await prisma.historialEstadoCliente.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.historialProducto.deleteMany({});
  await prisma.precio.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.historialEstadoUsuario.deleteMany({});

  const despues = {
    ventas: await prisma.venta.count(),
    detalleVenta: await prisma.detalleVenta.count(),
    clientes: await prisma.cliente.count(),
    productos: await prisma.producto.count(),
    precios: await prisma.precio.count(),
    stock: await prisma.stock.count(),
    grupos: await prisma.grupoPrecioEspecial.count(),
    usuarios: await prisma.usuario.count(),
    sucursales: await prisma.sucursal.count(),
  };
  console.log('DESPUÉS:', despues);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
