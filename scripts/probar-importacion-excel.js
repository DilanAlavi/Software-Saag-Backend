const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { PrismaService } = require('../dist/infrastructure/persistence/prisma/prisma.service');
const { ProductoPrismaRepository } = require('../dist/infrastructure/persistence/prisma/producto.prisma.repository');
const { PrecioPrismaRepository } = require('../dist/infrastructure/persistence/prisma/precio.prisma.repository');
const { ImportacionProductoService } = require('../dist/application/producto/importacion-producto.service');

async function main() {
  const prisma = new PrismaService();
  const productoRepo = new ProductoPrismaRepository(prisma);
  const precioRepo = new PrecioPrismaRepository(prisma);
  const servicio = new ImportacionProductoService(productoRepo, precioRepo);

  const admin = await prisma.usuario.findUnique({ where: { username: 'admin' } });

  const filas = [
    // Caso 1: valido, producto nuevo, con empaquetado y venta forzada por paquete
    {
      'Nombre': 'Disco de corte 4.5 pulg',
      'Nombres alternativos': 'disco esmeril, disco corte metal',
      'Marca': 'Bosch',
      'Tipo': 'FERRETERIA',
      'Codigo': 'DISCO-TEST-001',
      'Unidades por paquete': 10,
      'Unidades por caja': 50,
      'Vender solo por paquete (SI/NO)': 'SI',
      'Precio Base': 8,
      'Standard 1': 12,
      'Standard 2': 11,
      'Mayor 1': 10,
      'Mayor 2': 9.5,
      'Plomeria': 11,
      'Carpinteria': 11,
      'Electricista': 11,
      'Precio Caja': 9,
      'Cantidad minima descuento Standard 1': '',
      'Precio descuento Standard 1': '',
    },
    // Caso 2: codigo duplicado (Martillo ya existe) -> debe fallar
    {
      'Nombre': 'Martillo de bola 16oz',
      'Nombres alternativos': '',
      'Marca': 'Truper',
      'Tipo': 'FERRETERIA',
      'Codigo': '7506005923456',
      'Unidades por paquete': '',
      'Unidades por caja': '',
      'Vender solo por paquete (SI/NO)': '',
      'Precio Base': 10,
      'Standard 1': 15,
      'Standard 2': 14,
      'Mayor 1': 13,
      'Mayor 2': 12,
      'Plomeria': 14,
      'Carpinteria': 14,
      'Electricista': 14,
      'Precio Caja': '',
      'Cantidad minima descuento Standard 1': '',
      'Precio descuento Standard 1': '',
    },
    // Caso 3: tipo invalido -> debe fallar
    {
      'Nombre': 'Producto tipo invalido',
      'Nombres alternativos': '',
      'Marca': '',
      'Tipo': 'JARDINERIA',
      'Codigo': 'TEST-002',
      'Unidades por paquete': '',
      'Unidades por caja': '',
      'Vender solo por paquete (SI/NO)': '',
      'Precio Base': 5,
      'Standard 1': 8,
      'Standard 2': 7,
      'Mayor 1': 6,
      'Mayor 2': 6,
      'Plomeria': 7,
      'Carpinteria': 7,
      'Electricista': 7,
      'Precio Caja': '',
      'Cantidad minima descuento Standard 1': '',
      'Precio descuento Standard 1': '',
    },
    // Caso 4: vender solo por paquete SI pero sin unidades por paquete -> debe fallar
    {
      'Nombre': 'Producto sin paquete definido',
      'Nombres alternativos': '',
      'Marca': '',
      'Tipo': 'ELECTRICO',
      'Codigo': 'TEST-003',
      'Unidades por paquete': '',
      'Unidades por caja': '',
      'Vender solo por paquete (SI/NO)': 'SI',
      'Precio Base': 5,
      'Standard 1': 8,
      'Standard 2': 7,
      'Mayor 1': 6,
      'Mayor 2': 6,
      'Plomeria': 7,
      'Carpinteria': 7,
      'Electricista': 7,
      'Precio Caja': '',
      'Cantidad minima descuento Standard 1': '',
      'Precio descuento Standard 1': '',
    },
    // Caso 5: precio menor o igual al costo -> debe fallar
    {
      'Nombre': 'Producto precio invalido',
      'Nombres alternativos': '',
      'Marca': '',
      'Tipo': 'PLOMERIA',
      'Codigo': 'TEST-004',
      'Unidades por paquete': '',
      'Unidades por caja': '',
      'Vender solo por paquete (SI/NO)': '',
      'Precio Base': 20,
      'Standard 1': 15,
      'Standard 2': 25,
      'Mayor 1': 22,
      'Mayor 2': 21,
      'Plomeria': 22,
      'Carpinteria': 22,
      'Electricista': 22,
      'Precio Caja': '',
      'Cantidad minima descuento Standard 1': '',
      'Precio descuento Standard 1': '',
    },
  ];

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
  const buffer = XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' });

  const resultado = await servicio.importar(buffer, admin.id);
  console.log(JSON.stringify(resultado, null, 2));

  const creado = await prisma.producto.findUnique({
    where: { codigo: 'DISCO-TEST-001' },
    include: { precio: true },
  });
  console.log('\nProducto creado vía Excel:', creado);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
