const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const producto = await prisma.producto.findUnique({ where: { codigo: 'TERM-2X32' } });
  if (!producto) throw new Error('No se encontró Termico 2x32');
  console.log('Antes:', producto.notaVenta);
  const actualizado = await prisma.producto.update({
    where: { id: producto.id },
    data: { notaVenta: null },
  });
  console.log('Después:', actualizado.notaVenta);
}
main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
