const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const productos = await prisma.producto.findMany({
    where: { ventaSoloPorPaquete: false, unidadesPorPaquete: { not: null } },
    select: { id: true, nombre: true, unidadesPorPaquete: true, unidadesPorCaja: true },
    orderBy: { nombre: 'asc' },
  });
  console.log('Productos con ventaSoloPorPaquete=false pero unidadesPorPaquete definido (afectados por el switch de sucursal):');
  productos.forEach(p => console.log(`- ${p.nombre} (paquete: ${p.unidadesPorPaquete}, caja: ${p.unidadesPorCaja})`));
  console.log('Total:', productos.length);
}
main().then(()=>prisma.$disconnect());
