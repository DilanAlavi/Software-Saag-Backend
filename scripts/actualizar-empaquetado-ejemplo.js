const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const producto = await prisma.producto.update({
    where: { id: 1 },
    data: {
      unidadesPorPaquete: 10,
      unidadesPorCaja: 100,
      ventaSoloPorPaquete: false,
    },
  });
  console.log('Producto actualizado con empaquetado:', producto);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
