const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const producto = await prisma.producto.findFirst({ where: { nombre: 'Martillo de bola 16oz' } });
  const central = await prisma.sucursal.findFirst({ where: { nombre: 'Central' } });

  const stock = await prisma.stock.upsert({
    where: { productoId_sucursalId: { productoId: producto.id, sucursalId: central.id } },
    create: {
      productoId: producto.id,
      sucursalId: central.id,
      area: 'Pasillo 3, estante B',
      cantidad: 25,
    },
    update: {},
  });

  console.log('Stock cargado para:', producto.nombre, 'en', central.nombre, stock);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
