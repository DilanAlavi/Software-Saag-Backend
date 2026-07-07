-- CreateTable
CREATE TABLE "HistorialEstadoUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "estadoAnterior" BOOLEAN NOT NULL,
    "estadoNuevo" BOOLEAN NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realizadoPorId" INTEGER NOT NULL,

    CONSTRAINT "HistorialEstadoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialEstadoCliente" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "estadoAnterior" BOOLEAN NOT NULL,
    "estadoNuevo" BOOLEAN NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realizadoPorId" INTEGER NOT NULL,

    CONSTRAINT "HistorialEstadoCliente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoUsuario" ADD CONSTRAINT "HistorialEstadoUsuario_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoCliente" ADD CONSTRAINT "HistorialEstadoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialEstadoCliente" ADD CONSTRAINT "HistorialEstadoCliente_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
