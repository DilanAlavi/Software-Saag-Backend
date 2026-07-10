const { PrismaService } = require('../dist/infrastructure/persistence/prisma/prisma.service');
const { ClientePrismaRepository } = require('../dist/infrastructure/persistence/prisma/cliente.prisma.repository');
const { ClienteService } = require('../dist/application/cliente/cliente.service');
const {
  GrupoPrecioEspecialPrismaRepository,
} = require('../dist/infrastructure/persistence/prisma/grupo-precio-especial.prisma.repository');
const { GrupoPrecioEspecialService } = require('../dist/application/grupo-precio-especial/grupo-precio-especial.service');

let fallas = 0;
function check(nombre, cond, detalle) {
  if (cond) {
    console.log(`OK   - ${nombre}`);
  } else {
    fallas++;
    console.log(`FAIL - ${nombre} ${detalle ? '=> ' + detalle : ''}`);
  }
}

async function main() {
  const prisma = new PrismaService();
  const clienteRepo = new ClientePrismaRepository(prisma);
  const clienteService = new ClienteService(clienteRepo);
  const grupoRepo = new GrupoPrecioEspecialPrismaRepository(prisma);
  const grupoService = new GrupoPrecioEspecialService(grupoRepo);

  // ---------- Cliente sin sucursalId, con grupos incluidos ----------
  const clientes = await clienteService.listar({});
  check('Cliente ya no tiene campo sucursalId', clientes[0].sucursalId === undefined);
  check('Cliente trae array de grupos (aunque vacío)', Array.isArray(clientes[0].grupos));

  const carlos = clientes.find((c) => c.nombre === 'Carlos');
  const grupoCintas = (await grupoService.listar()).find((g) => g.nombre === 'Cintas');

  // ---------- Editar cliente ----------
  const actualizado = await clienteService.actualizar(carlos.id, { celular: '77712345' });
  check('Actualizar cliente cambia el celular', actualizado.celular === '77712345');

  // ---------- Asignar grupo especial a un cliente ----------
  const yaEstaba = grupoCintas.clientes.some((c) => c.id === carlos.id);
  if (yaEstaba) {
    await grupoService.quitarCliente(grupoCintas.id, carlos.id);
  }
  await grupoService.agregarCliente(grupoCintas.id, carlos.id);
  const clientesConGrupo = await clienteService.listar({});
  const carlosConGrupo = clientesConGrupo.find((c) => c.id === carlos.id);
  check('Cliente ahora aparece con el grupo Cintas asignado', carlosConGrupo.grupos.some((g) => g.id === grupoCintas.id));

  await grupoService.quitarCliente(grupoCintas.id, carlos.id);
  const clientesSinGrupo = await clienteService.listar({});
  const carlosSinGrupo = clientesSinGrupo.find((c) => c.id === carlos.id);
  check('Quitar el grupo lo saca correctamente', !carlosSinGrupo.grupos.some((g) => g.id === grupoCintas.id));

  // ---------- Editar grupo (nombre/categoría) ----------
  const grupoActualizado = await grupoService.actualizar(grupoCintas.id, { nombre: 'Cintas de goteo' });
  check('Actualizar grupo cambia el nombre', grupoActualizado.nombre === 'Cintas de goteo');
  await grupoService.actualizar(grupoCintas.id, { nombre: 'Cintas' });

  console.log(`\n${fallas === 0 ? 'TODO OK' : `${fallas} FALLA(S) ENCONTRADA(S)`}`);
  await prisma.$disconnect();
  process.exit(fallas === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('ERROR INESPERADO:', e);
  process.exit(1);
});
