const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const PROD_URL =
  'postgresql://postgres.yjpsxaugprzkohcbouqu:Ucb.13290695@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const prisma = new PrismaClient({ datasources: { db: { url: PROD_URL } } });

async function main() {
  const central1 = await prisma.sucursal.create({
    data: { nombre: 'Central la Cancha', tipo: 'SUCURSAL' },
  });
  const central2 = await prisma.sucursal.create({
    data: { nombre: 'Central Barrientos', tipo: 'SUCURSAL' },
  });
  console.log('Sucursales creadas:', central1.nombre, central2.nombre);

  const passwordHash = await bcrypt.hash('1234', 10);

  const usuarios = [
    { nombre: 'Dilan', rol: 'ADMIN', sucursalId: null },
    { nombre: 'Gisel', rol: 'ADMIN', sucursalId: null },
    { nombre: 'Diego', rol: 'ADMIN', sucursalId: null },
    { nombre: 'Alejandra', rol: 'ADMIN', sucursalId: null },
    { nombre: 'Aida', rol: 'ADMIN_SUCURSAL', sucursalId: central1.id },
    { nombre: 'Santiago', rol: 'ADMIN_SUCURSAL', sucursalId: central2.id },
  ];

  for (const u of usuarios) {
    const username = u.nombre.toLowerCase();
    await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        apellidoPaterno: u.nombre,
        celular: '00000000',
        username,
        password: passwordHash,
        rol: u.rol,
        sucursalId: u.sucursalId,
      },
    });
    console.log(`Usuario creado: ${username} / 1234 — ${u.rol}${u.sucursalId ? ' (sucursal ' + u.sucursalId + ')' : ''}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
