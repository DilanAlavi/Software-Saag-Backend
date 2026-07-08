const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const producto = await prisma.producto.findFirst({ where: { nombre: 'Martillo de bola 16oz' } });

  const precio = await prisma.precio.upsert({
    where: { productoId: producto.id },
    create: {
      productoId: producto.id,
      precioCosto: 45.5,
      menor1: 65.0,
      menor2: 60.0,
      mayor1: 55.0,
      mayor2: 52.0,
      plomeria: 58.0,
      carpinteria: 58.0,
      electricista: 58.0,
      precioCaja: 50.0,
      cantidadMinimaDescuentoMenor1: 10,
      precioDescuentoMenor1: 62.0,
    },
    update: {},
  });

  console.log('Precios cargados para:', producto.nombre, precio);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
