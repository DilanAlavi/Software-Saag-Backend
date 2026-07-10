const { PrismaService } = require('../dist/infrastructure/persistence/prisma/prisma.service');
const { VentaPrismaRepository } = require('../dist/infrastructure/persistence/prisma/venta.prisma.repository');
const { VentaService } = require('../dist/application/venta/venta.service');

async function main() {
  const prisma = new PrismaService();
  const ventaRepo = new VentaPrismaRepository(prisma);
  const ventaService = new VentaService(ventaRepo);

  const vendedor = { sub: 3, rol: 'VENDEDOR', sucursalId: 1 };
  const vendedor2 = { sub: 4, rol: 'VENDEDOR', sucursalId: 1 };
  const adminSucursal = { sub: 2, rol: 'ADMIN_SUCURSAL', sucursalId: 1 };

  const ventas = [
    { usuario: vendedor, clienteId: 1, lineas: [{ productoId: 1, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 70 },
    { usuario: vendedor2, clienteId: 5, lineas: [{ productoId: 1, cantidad: 4 }], pagarAhora: true, efectivoRecibido: 250 },
    { usuario: vendedor, clienteId: 3, lineas: [{ productoId: 6, cantidad: 2 }], pagarAhora: false },
    { usuario: adminSucursal, clienteId: 2, lineas: [{ productoId: 1, cantidad: 2 }, { productoId: 6, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 250 },
    { usuario: vendedor2, clienteId: 4, lineas: [{ productoId: 6, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 100 },
    { usuario: vendedor, clienteId: 6, lineas: [{ productoId: 6, cantidad: 3 }], pagarAhora: false },
    { usuario: vendedor, clienteId: 5, lineas: [{ productoId: 1, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 60 },
    { usuario: vendedor2, clienteId: 1, lineas: [{ productoId: 6, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 100 },
    { usuario: adminSucursal, clienteId: 3, lineas: [{ productoId: 1, cantidad: 5 }], pagarAhora: false },
    { usuario: vendedor, clienteId: 2, lineas: [{ productoId: 6, cantidad: 2 }, { productoId: 1, cantidad: 1 }], pagarAhora: true, efectivoRecibido: 300 },
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
