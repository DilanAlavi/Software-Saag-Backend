const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const yaExisten = await prisma.cliente.count();
  if (yaExisten > 0) {
    console.log('Ya existen clientes, no se vuelve a sembrar.');
    return;
  }

  const central = await prisma.sucursal.findFirst({ where: { nombre: 'Central' } });

  const clientes = [
    { nombre: 'Juan', apellidoPaterno: 'Pérez', celular: '70011122', rol: 'MAYOR_1' },
    { nombre: 'María', apellidoPaterno: 'Gómez', celular: '70022233', rol: 'MAYOR_2' },
    { nombre: 'Carlos', apellidoPaterno: 'Rojas', celular: '70033344', rol: 'REGULAR' },
    { nombre: 'Ana', apellidoPaterno: 'Vargas', celular: '70044455', rol: 'REGULAR_2' },
    { nombre: 'Pedro', apellidoPaterno: 'Flores', celular: '70055566', rol: 'CARPINTERO' },
    { nombre: 'Luis', apellidoPaterno: 'Mamani', celular: '70066677', rol: 'PLOMERO' },
  ];

  for (const c of clientes) {
    await prisma.cliente.create({ data: { ...c, sucursalId: central?.id ?? null } });
    console.log(`Cliente creado: ${c.nombre} ${c.apellidoPaterno} (${c.rol})`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
