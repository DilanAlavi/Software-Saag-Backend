const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sucursal = await prisma.sucursal.findFirst({ where: { nombre: { contains: 'Cancha', mode: 'insensitive' } } });
  if (!sucursal) throw new Error('No se encontró la sucursal Central la Cancha');
  console.log('Antes:', sucursal.nombre, sucursal.modalidadVentaPaquete);

  const actualizada = await prisma.sucursal.update({
    where: { id: sucursal.id },
    data: { modalidadVentaPaquete: null },
  });
  console.log('Después:', actualizada.nombre, actualizada.modalidadVentaPaquete);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
