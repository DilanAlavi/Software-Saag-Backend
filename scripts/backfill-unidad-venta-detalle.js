const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const detalles = await prisma.detalleVenta.findMany({
    where: { unidadVenta: null, unidadVentaTamano: null },
    include: { producto: true },
  });
  console.log('Detalles a rellenar:', detalles.length);

  let actualizados = 0;
  for (const d of detalles) {
    if (d.producto.unidadVenta === null && d.producto.unidadVentaTamano === null) continue;
    await prisma.detalleVenta.update({
      where: { id: d.id },
      data: {
        unidadVenta: d.producto.unidadVenta,
        unidadVentaTamano: d.producto.unidadVentaTamano,
      },
    });
    actualizados++;
  }
  console.log('Actualizados (con unidad real, no pieza suelta):', actualizados);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
