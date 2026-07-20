const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const codigos = ['ACO501','ELE632','KM-1143','DDU150','BID025','AW-P08','MCF012'];
  const rows = await prisma.producto.findMany({ where: { codigo: { in: codigos } }, select: { codigo: true, nombre: true } });
  console.log(rows);
  const total = await prisma.producto.count();
  console.log('Total productos:', total);
}
main().then(()=>prisma.$disconnect());
