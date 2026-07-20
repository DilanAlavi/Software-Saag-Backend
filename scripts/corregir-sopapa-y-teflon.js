const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Corrige Sopapas: resto = mayor + 10 (no igual a mayor)
  const eco = await prisma.producto.findUnique({ where: { codigo: 'SOPAPA-ECO' } });
  const ref = await prisma.producto.findUnique({ where: { codigo: 'SOPAPA-REF' } });
  if (!eco || !ref) throw new Error('No se encontraron los productos Sopapa');

  await prisma.precio.update({
    where: { productoId: eco.id },
    data: { menor1: 80, menor2: 80, plomeria: 80, carpinteria: 80, electricista: 80 },
  });
  await prisma.precio.update({
    where: { productoId: ref.id },
    data: { menor1: 90, menor2: 90, plomeria: 90, carpinteria: 90, electricista: 90 },
  });
  console.log('Sopapa Económico -> resto 80, Sopapa Reforzado -> resto 90');

  // Crea Teflon
  const existente = await prisma.producto.findUnique({ where: { codigo: 'TEFLON' } });
  if (existente) {
    console.log('Teflón ya existe, se omite creación');
  } else {
    const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } });
    const creado = await prisma.producto.create({
      data: {
        nombre: 'Teflón',
        codigo: 'TEFLON',
        tipoProducto: 'PLOMERIA',
        unidadesPorPaquete: 12,
        ventaSoloPorPaquete: true,
        precio: {
          create: {
            precioCosto: 12,
            menor1: 15,
            menor2: 15,
            mayor1: 13,
            mayor2: 13,
            plomeria: 15,
            carpinteria: 15,
            electricista: 15,
            precioPiezaSuelta: 2,
            precioCaja: 18,
          },
        },
      },
    });
    await prisma.historialProducto.create({
      data: { productoId: creado.id, accion: 'CREACION', realizadoPorId: admin.id },
    });
    console.log('Teflón creado:', creado.id);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
