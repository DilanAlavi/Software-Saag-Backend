// Seed para el trabajo de "Ganancias": crea la cuenta admin de Salvador y los 9 productos
// de plomería (con sus precios) que se usarán para generar ventas de prueba.
// Usa el DATABASE_URL del .env local (staging) — no hardcodea ninguna URL.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SALVADOR = {
  nombre: 'Salvador',
  apellidoPaterno: 'Salvador',
  celular: '00000000',
  username: 'salvador',
  password: 'Salvador.2026',
  rol: 'ADMIN',
};

const PRODUCTOS = [
  {
    codigo: 'SHFU-01',
    nombre: 'Cinta de goteo 10 cm',
    nombresAlternativos: ['Cinta goteo', 'cinta am'],
    unidadesPorCaja: 50,
    precio: { precioCosto: 510.67, menor1: 1050, menor2: 1000, mayor1: 850, mayor2: 760, plomeria: 1000, carpinteria: 1000, electricista: 1000 },
  },
  {
    codigo: 'SHFU-02',
    nombre: 'Cinta de goteo 15 cm',
    nombresAlternativos: [],
    unidadesPorCaja: 1,
    precio: { precioCosto: 481.12, menor1: 1050, menor2: 1000, mayor1: 850, mayor2: 750, plomeria: 1000, carpinteria: 1000, electricista: 1000 },
  },
  {
    codigo: 'SHFU-03',
    nombre: 'Collarín 32mm x 3/4" (1" x 3/4")',
    nombresAlternativos: ['Cuellera 32mm x 3/4"', 'Collarín 1" x 3/4"', 'Cuellera 1" x 3/4"'],
    unidadesPorCaja: 210,
    precio: { precioCosto: 4.995, menor1: 15, menor2: 12, mayor1: 9, mayor2: 9, plomeria: 12, carpinteria: 15, electricista: 15 },
  },
  {
    codigo: 'SHFU-04',
    nombre: 'Collarín 32mm x 1" (1" x 1")',
    nombresAlternativos: ['Cuellera 32mm x 1"', 'Collarín 1" x 1"', 'Cuellera 1" x 1"'],
    unidadesPorCaja: 210,
    precio: { precioCosto: 5.13, menor1: 15, menor2: 13, mayor1: 9, mayor2: 9, plomeria: 12, carpinteria: 15, electricista: 15, precioPiezaSuelta: 5 },
  },
  {
    codigo: 'SHFU-05',
    nombre: 'Collarín 50mm x 1/2" (1 1/2" x 1/2")',
    nombresAlternativos: ['Cuellera 50mm x 1/2"', 'Collarín 1 1/2" x 1/2"', 'Cuellera 1 1/2" x 1/2"'],
    unidadesPorCaja: 130,
    precio: { precioCosto: 6.75, menor1: 18, menor2: 15, mayor1: 13, mayor2: 13, plomeria: 15, carpinteria: 18, electricista: 18 },
  },
  {
    codigo: 'SHFU-06',
    nombre: 'Collarín 50mm x 1" (1 1/2" x 1")',
    nombresAlternativos: ['Cuellera 50mm x 1"', 'Collarín 1 1/2" x 1"', 'Cuellera 1 1/2" x 1"'],
    unidadesPorCaja: 120,
    precio: { precioCosto: 7.29, menor1: 18, menor2: 16, mayor1: 13, mayor2: 13, plomeria: 15, carpinteria: 18, electricista: 18 },
  },
  {
    codigo: 'SHFU-07',
    nombre: 'Collarín 63mm x 1/2" (2" x 1/2")',
    nombresAlternativos: ['Cuellera 63mm x 1/2"', 'Collarín 2" x 1/2"', 'Cuellera 2" x 1/2"'],
    unidadesPorCaja: 100,
    precio: { precioCosto: 7.83, menor1: 20, menor2: 18, mayor1: 16, mayor2: 16, plomeria: 18, carpinteria: 16, electricista: 16 },
  },
  {
    codigo: 'SHFU-08',
    nombre: 'Collarín 63mm x 1" (2" x 1")',
    nombresAlternativos: ['Cuellera 63mm x 1"', 'Collarín 2" x 1"', 'Cuellera 2" x 1"'],
    unidadesPorCaja: 100,
    precio: { precioCosto: 8.1, menor1: 23, menor2: 20, mayor1: 18, mayor2: 18, plomeria: 20, carpinteria: 23, electricista: 23 },
  },
  {
    codigo: 'SHFU-09',
    nombre: 'Collarín 90mm x 1/2" (3" x 1/2")',
    nombresAlternativos: ['Cuellera 90mm x 1/2"', 'Collarín 3" x 1/2"', 'Cuellera 3" x 1/2"'],
    unidadesPorCaja: 70,
    precio: { precioCosto: 11.88, menor1: 35, menor2: 28, mayor1: 26, mayor2: 26, plomeria: 28, carpinteria: 35, electricista: 35 },
  },
];

async function seedSalvador() {
  const existente = await prisma.usuario.findUnique({ where: { username: SALVADOR.username } });
  if (existente) {
    console.log(`Usuario '${SALVADOR.username}' ya existe (id ${existente.id}), no se modifica.`);
    return existente;
  }

  const central = await prisma.sucursal.findFirst({ where: { tipo: 'CENTRAL' } });
  const passwordHash = await bcrypt.hash(SALVADOR.password, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nombre: SALVADOR.nombre,
      apellidoPaterno: SALVADOR.apellidoPaterno,
      celular: SALVADOR.celular,
      username: SALVADOR.username,
      password: passwordHash,
      rol: SALVADOR.rol,
      sucursalId: central ? central.id : null,
    },
  });
  console.log(`Usuario creado: ${SALVADOR.username} / ${SALVADOR.password} (ADMIN)`);
  return usuario;
}

async function seedProductos(realizadoPorId) {
  for (const p of PRODUCTOS) {
    const existente = await prisma.producto.findUnique({ where: { codigo: p.codigo } });
    let producto = existente;

    if (!existente) {
      producto = await prisma.producto.create({
        data: {
          nombre: p.nombre,
          nombresAlternativos: p.nombresAlternativos,
          tipoProducto: 'PLOMERIA',
          codigo: p.codigo,
          unidadesPorCaja: p.unidadesPorCaja,
          ventaSoloPorPaquete: false,
        },
      });
      await prisma.historialProducto.create({
        data: { productoId: producto.id, accion: 'CREACION', realizadoPorId },
      });
      console.log(`Producto creado: ${producto.codigo} - ${producto.nombre}`);
    } else {
      console.log(`Producto '${p.codigo}' ya existe (id ${existente.id}), no se recrea.`);
    }

    await prisma.precio.upsert({
      where: { productoId: producto.id },
      create: { productoId: producto.id, ...p.precio },
      update: { ...p.precio },
    });
  }
}

async function main() {
  const salvador = await seedSalvador();
  await seedProductos(salvador.id);
  console.log('Listo.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
