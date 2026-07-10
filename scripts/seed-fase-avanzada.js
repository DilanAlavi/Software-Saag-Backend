const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Ajustar Central: vende Discos solo por paquete
  const central = await prisma.sucursal.update({
    where: { id: 1 },
    data: { modalidadVentaPaquete: 'PAQUETE' },
  });
  console.log('Central actualizada:', central.nombre, central.modalidadVentaPaquete);

  // 2. Crear 2 sucursales + 1 depósito
  const sucursalNorte = await prisma.sucursal.create({
    data: {
      nombre: 'Sucursal Norte',
      tipo: 'SUCURSAL',
      ciudad: 'Cochabamba',
      zona: 'Norte',
      modalidadVentaPaquete: 'PIEZA',
    },
  });
  const sucursalSur = await prisma.sucursal.create({
    data: {
      nombre: 'Sucursal Sur',
      tipo: 'SUCURSAL',
      ciudad: 'Cochabamba',
      zona: 'Sur',
    },
  });
  const deposito = await prisma.sucursal.create({
    data: {
      nombre: 'Depósito Principal',
      tipo: 'DEPOSITO',
      ciudad: 'Cochabamba',
    },
  });
  console.log('Ubicaciones creadas:', sucursalNorte.nombre, sucursalSur.nombre, deposito.nombre);

  // 3. Ajustar el producto de prueba "Disco de corte" con precio de pieza suelta
  const disco = await prisma.producto.findFirst({ where: { codigo: 'DISCO-TEST-001' } });
  if (disco) {
    await prisma.precio.update({
      where: { productoId: disco.id },
      data: { precioPiezaSuelta: 1.2 },
    });

    // Stock en Central (solo paquete) y en Sucursal Norte (pieza suelta)
    await prisma.stock.upsert({
      where: { productoId_sucursalId: { productoId: disco.id, sucursalId: central.id } },
      create: { productoId: disco.id, sucursalId: central.id, area: 'Estante de abrasivos', cantidad: 300 },
      update: { cantidad: 300 },
    });
    await prisma.stock.upsert({
      where: { productoId_sucursalId: { productoId: disco.id, sucursalId: sucursalNorte.id } },
      create: { productoId: disco.id, sucursalId: sucursalNorte.id, area: 'Mostrador', cantidad: 47 },
      update: { cantidad: 47 },
    });
    console.log('Stock cargado para Disco de corte en Central y Sucursal Norte');
  }

  // 4. Crear producto "Cinta de goteo" + precio, para el ejemplo de Grupo de Precio Especial
  const admin = await prisma.usuario.findUnique({ where: { username: 'admin' } });
  let cinta = await prisma.producto.findFirst({ where: { codigo: 'CINTA-GOTEO-001' } });
  if (!cinta) {
    cinta = await prisma.producto.create({
      data: {
        nombre: 'Cinta de goteo 16mm (rollo 100m)',
        marca: 'Netafim',
        tipoProducto: 'PLOMERIA',
        codigo: 'CINTA-GOTEO-001',
      },
    });
    await prisma.historialProducto.create({
      data: { productoId: cinta.id, accion: 'CREACION', realizadoPorId: admin.id },
    });
    await prisma.precio.create({
      data: {
        productoId: cinta.id,
        precioCosto: 60,
        menor1: 90,
        menor2: 85,
        mayor1: 75,
        mayor2: 70,
        plomeria: 80,
        carpinteria: 90,
        electricista: 90,
      },
    });
    console.log('Producto "Cinta de goteo" creado con precios');
  }

  // 5. Crear el Grupo de Precio Especial "Cintas" -> Mayor 2, y asignarlo a un cliente
  let grupo = await prisma.grupoPrecioEspecial.findFirst({ where: { nombre: 'Cintas' } });
  if (!grupo) {
    grupo = await prisma.grupoPrecioEspecial.create({
      data: { nombre: 'Cintas', categoriaAsignada: 'MAYOR_2' },
    });
    await prisma.grupoPrecioEspecialProducto.create({
      data: { grupoId: grupo.id, productoId: cinta.id },
    });
    const clienteEjemplo = await prisma.cliente.findFirst({ where: { rol: 'STANDARD_1' } });
    if (clienteEjemplo) {
      await prisma.clienteGrupoPrecioEspecial.create({
        data: { grupoId: grupo.id, clienteId: clienteEjemplo.id },
      });
      console.log(`Grupo "Cintas" creado y asignado a ${clienteEjemplo.nombre} (normalmente Standard 1, ahora Mayor 2 solo en Cintas)`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
