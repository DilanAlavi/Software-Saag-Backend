-- CreateEnum
CREATE TYPE "ModalidadVentaPaquete" AS ENUM ('PIEZA', 'PAQUETE', 'AMBOS');

-- AlterTable
ALTER TABLE "Precio" ADD COLUMN     "precioPiezaSuelta" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Sucursal" ADD COLUMN     "modalidadVentaPaquete" "ModalidadVentaPaquete";

-- CreateTable
CREATE TABLE "GrupoPrecioEspecial" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoriaAsignada" "RolCliente" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrupoPrecioEspecial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoPrecioEspecialProducto" (
    "id" SERIAL NOT NULL,
    "grupoId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "GrupoPrecioEspecialProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteGrupoPrecioEspecial" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "grupoId" INTEGER NOT NULL,

    CONSTRAINT "ClienteGrupoPrecioEspecial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrupoPrecioEspecial_nombre_key" ON "GrupoPrecioEspecial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoPrecioEspecialProducto_grupoId_productoId_key" ON "GrupoPrecioEspecialProducto"("grupoId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteGrupoPrecioEspecial_clienteId_grupoId_key" ON "ClienteGrupoPrecioEspecial"("clienteId", "grupoId");

-- AddForeignKey
ALTER TABLE "GrupoPrecioEspecialProducto" ADD CONSTRAINT "GrupoPrecioEspecialProducto_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoPrecioEspecial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoPrecioEspecialProducto" ADD CONSTRAINT "GrupoPrecioEspecialProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteGrupoPrecioEspecial" ADD CONSTRAINT "ClienteGrupoPrecioEspecial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteGrupoPrecioEspecial" ADD CONSTRAINT "ClienteGrupoPrecioEspecial_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "GrupoPrecioEspecial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

