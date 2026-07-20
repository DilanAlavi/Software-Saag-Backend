const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const productos = await prisma.producto.findMany({
    where: { nombre: { contains: 'Codo', mode: 'insensitive' } },
    include: { precio: true },
  });
  for (const p of productos) {
    console.log(p.id, p.nombre, 'unidadesPorPaquete:', p.unidadesPorPaquete, 'unidadesPorCaja:', p.unidadesPorCaja, 'ventaSoloPorPaquete:', p.ventaSoloPorPaquete, 'mayor1:', p.precio?.mayor1);
  }
}
main().then(()=>prisma.$disconnect());
