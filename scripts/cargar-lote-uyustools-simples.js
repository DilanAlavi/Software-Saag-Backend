const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Solo productos simples: sin nota de empaquetado especial, con nombre confirmado,
// y con base + menor + mayor completos. Todo lo demás se deja para la siguiente ronda.
const PRODUCTOS = [
  ['Acople niquelado 5pzs Uyus', 'ACO501', 20, 25, 22],
  ['Acople niquelado set 2pzs Uyus', 'ACO2FU', 15, 20, 17],
  ['Acoples bronce set de 5pzs Uyus', 'ACO502', 34, 40, 36],
  ['Alicate caimán 10\'\' Uyus', 'ALM210', 23, 30, 26],
  ['Alicate picoloro deluxe 10" Uyus', 'ALL210', 25.5, 30, 26],
  ['Alicate punta 6\'\' No.D15 Uyus', 'ALP6D15', 16, 20, 17],
  ['Alicate set 3pzs No.D15 DIN Uyus', 'AL3SD15', 49, 60, 52],
  ['Alicate universal 8\'\' No.D15 Uyus', 'ALU8D15', 22, 30, 24],
  ['Amarra plástica 4,8*300mm negra 100un/set Uyus', 'AMR105', 16.5, 20, 19],
  ['Amarra plástica 4,8*400mm Uyus', 'AMR106', 24, 30, 26],
  ['Broca p/metal escalonada 3pzs Uyus', 'BCE3SU', 74, 85, 80],
  ['Bombín tubo metal 590*44mm t/tru.(ama/nar/neg) Saikertools', 'BMS645', 33, 45, 38],
  ['Bombín corto c/bomba 38*260mm (ama/neg) Saikertools', 'BCS001', 30, 35, 32],
  ['Broca mix 16pzs-mm (fie/mad/conc) Uyus', 'BCX16S', 37, 45, 40],
  ['Cable batería 1000A*3mts Uyus', 'CBA100U', 96, 110, 100],
  ['Cable batería 200A*2,5mts Uyus', 'CBA20U', 32, 40, 36],
  ['Cable batería 500A 3mts Kamasa', 'KM-1143', 67, 80, 70],
  ['Cable batería 500A*3mts Uyus', 'CBA50U', 62, 80, 70],
  ['Cable extensión c/3tomas-10mts Uyus', 'CBE910U', 35, 45, 38],
  ['Cable extensión c/3tomas-3mts Uyus', 'CBE903U', 23, 30, 25],
  ['Cable extensión c/3tomas-5mts Uyus', 'CBE905U', 27, 35, 30],
  ['Cable extensión c/3tomas-7mts Uyus', 'CBE907U', 30, 38, 33],
  ['Caja de herramientas Makawa 17"', 'Mk-herr-17', 55, 70, 60],
  ['Cámara p/carretilla 350*8 c/eje Enduro rojo', 'JS-87C', 15, 25, 18],
  ['Cautín m/madera p/lápiz 40W Ferrawyy', 'CTA040', 10, 15, 12],
  ['Cautín m/madera p/lápiz 60W Ferrawyy', 'CTP060', 12, 18, 14],
  ['Cautín m/plástico p/plana 100W Uyus', 'CTU100', 46, 60, 50],
  ['Cautín m/plástico p/plana 150W Uyus', 'CTU150', 65, 80, 70],
  ['Cautín m/plástico p/plana 200W Uyus', 'CTU200', 105, 120, 110],
  ['Cautín t/lápiz amar/negro 40W Kamasa', 'KM-1137', 19.5, 30, 22],
  ['Cautín t/lápiz amar/negro 60W Kamasa', 'KM-1138', 21.5, 30, 24],
  ['Cinta amarilla con "peligro" 150mm*150mts Ferrawyy', 'CIN150P', 40, 45, 42],
  ['Cinta amarilla con "peligro" 75mm*305mts Ferrawyy', 'CIN305P', 40, 45, 42],
  ['Destornillador golpe 6pzs tipo 604 Uyus', 'DEG604', 32.5, 40, 35],
  ['Disco 7" con lija', 'DP180J', 26, 35, 28],
  ['Disco madera 4 1/2"*24T Uyus', 'DMA116', 16.5, 20, 18],
  ['Disco madera 4 1/2"*40T 200un/caja Uyus', 'DMA117', 22, 25, 24],
  ['Disco madera 7 1/4"*24T Uyus', 'DMD724', 28, 30, 29],
  ['Disco madera 7 1/4"*40T Uyus', 'DMD740', 33, 40, 35],
  ['Disco pulir c/5 lijas 4 1/2" Uyus', 'DP115J', 13, 20, 15],
  ['Electrodo E6013 1/8" (3,2mm) Uyus', 'ELE632', 19.5, 25, 23],
  ['Electrodo E6013 3/32" (2,5mm) Uyus', 'ELE625', 19.5, 25, 23],
  ['Engrapadora chica amarillo 0.7mm 4-14mm Uyus', 'EGU001', 35, 50, 40],
  ['Engrapadora chica amarillo 3en1 1.2mm 4-14mm Uyus', 'EGU002', 36, 50, 40],
  ['Engrasadora de alta presión 400cc negro manual Asaki', 'ASK-15590', 45, 55, 50],
  ['Escobilla copa 3" dorado', 'EBC003', 12, 15, 14],
  ['Escobilla copa 3" negro', 'EBC103', 14, 18, 16],
  ['Escobilla copa 4" dorado', 'EBC004', 16, 20, 18],
  ['Escobilla copa 4" negro', 'EBC104', 20, 25, 22],
  ['Escobilla copa 5" dorado', 'EBC005', 22, 28, 24],
  ['Escobilla tipo plato dorado 4,5" redonda', 'EBP045', 16, 25, 18],
  ['Escofina m/jebe 8" 3pzs Asaki', 'ASK-07413', 31.5, 40, 35],
  ['Escuadra pintada pequeño 8"*12" Asaki', 'ASK-09210', 6, 15, 10],
  ['Grapa para cable / grampa TV alternativo', 'GPC08N', 4, 7, 5],
  ['Jgo. separador d/nivelación cerámica 100pzs/2mm Kamasa', 'KM-1715', 10, 15, 12],
  ['Jgo. cuña d/nivelación cerámica Kamasa', 'KM-1718', 15, 20, 18],
  ['Llave combinación 11pzs Ferrawyy', 'YOS911', 52, 60, 55],
  ['Llave comb. 14pzs Cr-V satín Ferrawyy', 'YOS914', 93, 100, 95],
  ['Llave crecen amarillo N°10 Stanford', 'AW-P010', 27, 35, 29],
  ['Llave crecen amarillo N°12 Stanford', 'AW-P012', 38, 45, 40],
  ['Llave crecen amarillo N°6 Stanford', 'AW-P06', 13, 20, 17],
  ['Llave crecen amarillo N°8 Stanford', 'AW-P08', 19, 25, 22],
  ['Llave ojo y boca 11mm Ferrawyy', null, 4.5, 8, 5],
  ['Llave ojo y boca 12mm Ferrawyy', null, 4.5, 8, 5],
  ['Llave ojo y boca 10mm Ferrawyy', null, 4.5, 8, 5],
  ['Llave ojo y boca 13mm Ferrawyy', null, 5.5, 8, 6],
  ['Llave ojo y boca 14mm Ferrawyy', null, 5.5, 8, 6],
  ['Llave ojo y boca 8mm Ferrawyy', null, 3.5, 8, 4],
  ['Llave mandril/amoladora #13', 'YMA013', 3, 5, 4],
  ['Llave mandril/amoladora #16', 'YMA016', 5, 8, 6],
  ['Llave para taladro', 'TALAD-05', 5, 8, 6],
  ['Llave Stilson 8"', 'YSP008', 23, 30, 25],
  ['Llave Stilson 10" (Uyustools/Asaki)', 'YSP010', 31, 35, 32],
  ['Llave Stilson 12"', 'YSP012', 37, 45, 39],
  ['Marco sierra amarillo fija 12" Uyus', 'MCF012', 21, 25, 23],
  ['Nivel aluminio rojo 18"/450mm Makawa', 'MK-NR18', 26, 35, 30],
  ['Nivel torpedo 9" Norstar', 'SP-35', 10, 15, 12],
  ['Pegamento 12pzs/set Uyus', 'PEG62U', 10, 15, 12],
  ['Pelacable económico 0.6-2.6mm Asaki', 'ASK-05645', 11.5, 15, 13],
  ['Piedra p/esmeril verde 6" GR.60 Kamasa', 'KM-1181', 40, 50, 45],
  ['Disco liso 4 1/2" 5E naranja Kamasa', 'KM-1011', 42, 50, 45],
  ['Pistola p/aire p/limpiar 5pzs Kamasa', 'KM-1703', 26, 30, 28],
  ['Pistola silicona amarillo 15W Uyus', 'PSP315', 12, 20, 15],
  ['Porta electrodo 600A Asaki', 'ASK-15801', 17.5, 25, 20],
  ['Portasilicona reforzado SJ0010-A Uyus', 'PTS10U', 25.5, 30, 28],
  ['Prensa esquina 3" Asaki', 'ASK-07655', 18, 25, 20],
  ['Respirador o/doble c/repuesto e/caja GM304B Kamasa', 'KM-330', 21.5, 30, 25],
  ['Soplete 400ml', 'SPA075', 95, 110, 105],
  ['Terminal d/batería tipo normal 2pzs Total', 'TMB02N', 8.8, 12, 10],
  ['Tijera cortapasto m/madera 10" Asaki', 'ASK-05821', 22.5, 28, 24],
  ['Tijera p/podar 8" plástico Kamasa', 'KM-1688', 14, 20, 15],
];

async function main() {
  const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } });
  if (!admin) throw new Error('No se encontró un usuario ADMIN');

  for (const [nombre, codigo, base, menor, mayor] of PRODUCTOS) {
    if (codigo) {
      const existente = await prisma.producto.findUnique({ where: { codigo } });
      if (existente) {
        console.log(`YA EXISTE, se omite: ${nombre} (${codigo})`);
        continue;
      }
    }

    const creado = await prisma.producto.create({
      data: {
        nombre,
        codigo: codigo ?? undefined,
        tipoProducto: 'FERRETERIA',
        ventaSoloPorPaquete: false,
        precio: {
          create: {
            precioCosto: base,
            menor1: menor,
            menor2: menor,
            mayor1: mayor,
            mayor2: mayor,
            plomeria: menor,
            carpinteria: menor,
            electricista: menor,
          },
        },
      },
    });

    await prisma.historialProducto.create({
      data: { productoId: creado.id, accion: 'CREACION', realizadoPorId: admin.id },
    });

    console.log(`Creado: ${nombre} (${codigo ?? 'sin código'})`);
  }

  console.log('Listo. Total en la lista:', PRODUCTOS.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
