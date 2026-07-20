const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const existente = await prisma.grupoPrecioEspecial.findUnique({ where: { nombre: 'Sopapa' } });
  if (existente) {
    console.log('El grupo "Sopapa" ya existe, id:', existente.id);
    return;
  }

  const grupo = await prisma.grupoPrecioEspecial.create({
    data: { nombre: 'Sopapa', categoriaAsignada: 'MAYOR_2' },
  });

  const productos = await prisma.producto.findMany({
    where: { codigo: { in: ['SOPAPA-ECO', 'SOPAPA-REF'] } },
  });
  if (productos.length !== 2) {
    throw new Error(`Se esperaban 2 productos Sopapa, se encontraron ${productos.length}`);
  }

  for (const p of productos) {
    await prisma.grupoPrecioEspecialProducto.create({
      data: { grupoId: grupo.id, productoId: p.id },
    });
  }

  console.log('Grupo "Sopapa" creado, id:', grupo.id, '- productos agregados:', productos.map((p) => p.nombre));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
