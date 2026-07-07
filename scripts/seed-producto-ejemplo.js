const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuario.findUnique({ where: { username: 'admin' } });

  const producto = await prisma.producto.create({
    data: {
      nombre: 'Martillo de bola 16oz',
      nombresAlternativos: ['martillo carpintero', 'martillo bola'],
      marca: 'Truper',
      tipoProducto: 'FERRETERIA',
      codigo: '7506005923456',
      cantidad: 25,
      precioCosto: 45.5,
    },
  });

  await prisma.historialProducto.create({
    data: {
      productoId: producto.id,
      accion: 'CREACION',
      realizadoPorId: admin.id,
    },
  });

  console.log('Producto de ejemplo creado:', producto);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
