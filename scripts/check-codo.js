const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const producto = await prisma.producto.findFirst({
    where: { nombre: { contains: 'Codo', mode: 'insensitive' } },
    include: { precio: true },
  });
  console.log('Producto:', JSON.stringify(producto, null, 2));
  const sucursal = await prisma.sucursal.findFirst({ where: { nombre: { contains: 'Cancha', mode: 'insensitive' } } });
  console.log('Sucursal:', JSON.stringify(sucursal, null, 2));
}
main().then(()=>prisma.$disconnect());
