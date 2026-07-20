const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PRODUCTOS = [
  // ---- Cintas: solo paquete, mayor1=mayor2, resto=mayor+5 (Asatex Pequeño=20 especial) ----
  {
    nombre: 'Cinta Negra 3M',
    codigo: '123-M',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 10,
    ventaSoloPorPaquete: true,
    precioCosto: 65,
    mayor1: 70,
    mayor2: 70,
    resto: 75,
    nombreParaProforma: 'Cinta M',
  },
  {
    nombre: 'Cinta Narutex',
    codigo: '124-N',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 12,
    ventaSoloPorPaquete: true,
    precioCosto: 45,
    mayor1: 50,
    mayor2: 50,
    resto: 55,
  },
  {
    nombre: 'Cinta Asatex Grande',
    codigo: '125-A',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 12,
    ventaSoloPorPaquete: true,
    precioCosto: 45,
    mayor1: 50,
    mayor2: 50,
    resto: 55,
  },
  {
    nombre: 'Cinta Uyustools Mediano Colores',
    codigo: '125-U',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 10,
    ventaSoloPorPaquete: true,
    precioCosto: 28,
    mayor1: 30,
    mayor2: 30,
    resto: 35,
  },
  {
    nombre: 'Cinta Uyustools Mediano',
    codigo: '125-Um',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 10,
    ventaSoloPorPaquete: true,
    precioCosto: 28,
    mayor1: 30,
    mayor2: 30,
    resto: 35,
  },
  {
    nombre: 'Cinta Asatex Pequeño',
    codigo: '125-Ap',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 12,
    ventaSoloPorPaquete: true,
    precioCosto: 13,
    mayor1: 17,
    mayor2: 17,
    resto: 20, // especial: no sigue la regla de +5 (17+5=22), el usuario pidió redondear a 20
  },
  {
    nombre: 'Cinta Uyustools Grande Colores',
    codigo: '126-CO',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 10,
    ventaSoloPorPaquete: true,
    precioCosto: 45,
    mayor1: 50,
    mayor2: 50,
    resto: 55,
  },
  {
    nombre: 'Cinta Uyustools Grande',
    codigo: '126-LE',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 10,
    ventaSoloPorPaquete: true,
    precioCosto: 45,
    mayor1: 50,
    mayor2: 50,
    resto: 55,
  },

  // ---- Termico: redondeoSiempreArriba (misma logica que Grasa), paquete=6 (bipolar) ----
  {
    nombre: 'Termico 2x32',
    codigo: 'TERM-2X32',
    tipoProducto: 'ELECTRICO',
    unidadesPorPaquete: 6,
    ventaSoloPorPaquete: true,
    redondeoSiempreArriba: true,
    notaVenta: 'Se vende de 3 en 3',
    precioCosto: 215,
    mayor1: 220,
    mayor2: 220,
    resto: 230,
  },

  // ---- Sopapas: solo paquete de 12, sin venta suelta ----
  {
    nombre: 'Sopapa de lavandería Económico',
    codigo: 'SOPAPA-ECO',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 12,
    ventaSoloPorPaquete: true,
    precioCosto: 60,
    mayor1: 70,
    mayor2: 65,
    resto: 70, // NOTA: no se dio precio para roles normales; se usa el de Mayor 1 como default seguro
  },
  {
    nombre: 'Sopapa de lavandería Reforzado',
    codigo: 'SOPAPA-REF',
    tipoProducto: 'FERRETERIA',
    unidadesPorPaquete: 12,
    ventaSoloPorPaquete: true,
    precioCosto: 70,
    mayor1: 80,
    mayor2: 80,
    resto: 80,
  },

  // ---- Llaves de paso Italy: venta suelta normal, con nombre alternativo obligatorio en proforma ----
  {
    nombre: 'Llave de paso Italy 1/2"',
    codigo: 'LLAVE-ITALY-12',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 32,
    mayor1: 35,
    mayor2: 35,
    resto: 40,
    nombreParaProforma: 'Llave rojo de 1/2"',
  },
  {
    nombre: 'Llave de paso Italy 3/4"',
    codigo: 'LLAVE-ITALY-34',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 43,
    mayor1: 45,
    mayor2: 45,
    resto: 50,
    nombreParaProforma: 'Llave rojo de 3/4"',
  },
  {
    nombre: 'Llave de paso Italy 1 1/2"',
    codigo: 'LLAVE-ITALY-112',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 210,
    mayor1: 220,
    mayor2: 220,
    resto: 240,
    nombreParaProforma: 'Llave rojo de 1 1/2"',
  },
  {
    nombre: 'Llave de paso Italy 1"',
    codigo: 'LLAVE-ITALY-1',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 65,
    mayor1: 70,
    mayor2: 70,
    resto: 80,
    nombreParaProforma: 'Llave rojo de 1"',
  },

  // ---- Grifos ----
  {
    nombre: 'Grifo rojo Italy 1/2"',
    codigo: 'GRIFO-ROJO-ITALY-12',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 36,
    mayor1: 38,
    mayor2: 38,
    resto: 45,
    nombreParaProforma: 'Grifo rojo 1/2"',
  },
  {
    nombre: 'Grifo rojo Italy 3/4"',
    codigo: 'GRIFO-ROJO-ITALY-34',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 42,
    mayor1: 48,
    mayor2: 48,
    resto: 55,
    nombreParaProforma: 'Grifo rojo 3/4"',
  },
  {
    nombre: 'Grifo rojo Italy 1/2" segunda',
    codigo: 'GRIFO-ROJO-ITALY-12-SEG',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 26,
    mayor1: 28,
    mayor2: 28,
    resto: 30,
    nombreParaProforma: 'Grifo rojo 1/2 económico',
  },
  {
    nombre: 'Grifo Italy 1/2" económico',
    codigo: 'GRIFO-ITALY-12-ECO',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 18,
    mayor1: 20,
    mayor2: 20,
    resto: 25,
    nombreParaProforma: 'Grifo rojo económico 1/2"',
  },
  {
    nombre: 'Grifo LT 1/2"',
    codigo: 'GRIFO-LT-12',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 12,
    mayor1: 15,
    mayor2: 15,
    resto: 20,
  },
  {
    nombre: 'Grifo dorado 1/2"',
    codigo: 'GRIFO-DORADO-12',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 18,
    mayor1: 20,
    mayor2: 20,
    resto: 25,
  },
  {
    nombre: 'Grifo eko segunda',
    codigo: 'GRIFO-EKO-SEG',
    tipoProducto: 'PLOMERIA',
    ventaSoloPorPaquete: false,
    precioCosto: 18,
    mayor1: 20,
    mayor2: 20,
    resto: 25,
    nombreParaProforma: 'Grifo azul 1/2" económico',
  },

  // ---- Grifo plástico: producto normal, con paquete/caja informativos ----
  {
    nombre: 'Grifo plástico 1/2"',
    codigo: 'GRIFO-PLASTICO-12',
    tipoProducto: 'PLOMERIA',
    unidadesPorPaquete: 10,
    unidadesPorCaja: 220,
    ventaSoloPorPaquete: false,
    precioCosto: 8.6,
    mayor1: 13,
    mayor2: 13,
    menor1: 18,
    menor2: 15,
    resto: 15, // plomero/carpintero/electricista
  },
];

async function main() {
  const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } });
  if (!admin) throw new Error('No se encontró un usuario ADMIN');

  for (const p of PRODUCTOS) {
    const existente = await prisma.producto.findUnique({ where: { codigo: p.codigo } });
    if (existente) {
      console.log(`YA EXISTE, se omite: ${p.nombre} (${p.codigo})`);
      continue;
    }

    const creado = await prisma.producto.create({
      data: {
        nombre: p.nombre,
        codigo: p.codigo,
        tipoProducto: p.tipoProducto,
        unidadesPorPaquete: p.unidadesPorPaquete ?? null,
        unidadesPorCaja: p.unidadesPorCaja ?? null,
        ventaSoloPorPaquete: p.ventaSoloPorPaquete,
        redondeoSiempreArriba: p.redondeoSiempreArriba ?? false,
        notaVenta: p.notaVenta ?? null,
        nombreParaProforma: p.nombreParaProforma ?? null,
        precio: {
          create: {
            precioCosto: p.precioCosto,
            menor1: p.menor1 ?? p.resto,
            menor2: p.menor2 ?? p.resto,
            mayor1: p.mayor1,
            mayor2: p.mayor2,
            plomeria: p.resto,
            carpinteria: p.resto,
            electricista: p.resto,
          },
        },
      },
    });

    await prisma.historialProducto.create({
      data: { productoId: creado.id, accion: 'CREACION', realizadoPorId: admin.id },
    });

    console.log(`Creado: ${p.nombre} (${p.codigo})`);
  }

  console.log('Listo.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
