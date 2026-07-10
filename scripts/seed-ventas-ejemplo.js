const { PrismaService } = require('../dist/infrastructure/persistence/prisma/prisma.service');
const { VentaPrismaRepository } = require('../dist/infrastructure/persistence/prisma/venta.prisma.repository');
const { VentaService } = require('../dist/application/venta/venta.service');

async function main() {
  const prisma = new PrismaService();
  const ventaRepo = new VentaPrismaRepository(prisma);
  const ventaService = new VentaService(ventaRepo);

  const vendedor = { sub: 3, rol: 'VENDEDOR', sucursalId: 1 };
  const adminSucursal = { sub: 2, rol: 'ADMIN_SUCURSAL', sucursalId: 1 };

  const ventas = [
    { usuario: vendedor, clienteId: 3, lineas: [{ productoId: 1, cantidad: 2 }], pagarAhora: true, efectivoRecibido: 150 },
    { usuario: vendedor, clienteId: 1, lineas: [{ productoId: 6, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 100 },
    { usuario: adminSucursal, clienteId: 4, lineas: [{ productoId: 1, cantidad: 1 }], pagarAhora: false },
    { usuario: vendedor, clienteId: 2, lineas: [{ productoId: 1, cantidad: 3 }, { productoId: 6, cantidad: 2 }], pagarAhora: true, efectivoRecibido: 400 },
    { usuario: vendedor, clienteId: 6, lineas: [{ productoId: 6, cantidad: 1 }], pagarAhora: false },
  ];

  for (const v of ventas) {
    const creada = await ventaService.crear(v.usuario, {
      clienteId: v.clienteId,
      lineas: v.lineas,
      pagarAhora: v.pagarAhora,
      efectivoRecibido: v.efectivoRecibido,
    });
    console.log(`Venta #${creada.id} creada — cliente ${v.clienteId} — Bs ${creada.total} — ${creada.estado}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
