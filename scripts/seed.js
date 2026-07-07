const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const central = await prisma.sucursal.create({
    data: {
      nombre: 'Central',
      tipo: 'CENTRAL',
      ciudad: 'Cochabamba',
    },
  });

  const usuarios = [
    {
      nombre: 'Admin',
      apellidoPaterno: 'Sistema',
      ci: '0000001',
      celular: '00000000',
      username: 'admin',
      password: 'Admin.2026',
      rol: 'ADMIN',
    },
    {
      nombre: 'Admin',
      apellidoPaterno: 'Sucursal',
      ci: '0000002',
      celular: '00000000',
      username: 'adminsucursal',
      password: 'AdminSuc.2026',
      rol: 'ADMIN_SUCURSAL',
    },
    {
      nombre: 'Vendedor',
      apellidoPaterno: 'Prueba',
      ci: '0000003',
      celular: '00000000',
      username: 'vendedor',
      password: 'Vendedor.2026',
      rol: 'VENDEDOR',
    },
  ];

  for (const u of usuarios) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.usuario.create({
      data: {
        nombre: u.nombre,
        apellidoPaterno: u.apellidoPaterno,
        ci: u.ci,
        celular: u.celular,
        username: u.username,
        password: passwordHash,
        rol: u.rol,
        sucursalId: central.id,
      },
    });
    console.log(`Usuario creado: ${u.username} / ${u.password}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
