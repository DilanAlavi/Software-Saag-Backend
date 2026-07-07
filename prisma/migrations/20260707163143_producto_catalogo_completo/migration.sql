-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('CARPINTERIA', 'FERRETERIA', 'PLOMERIA', 'ELECTRICO');

-- CreateEnum
CREATE TYPE "AccionProducto" AS ENUM ('CREACION', 'ELIMINACION');

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "createdAt",
DROP COLUMN "precio",
DROP COLUMN "stock",
ADD COLUMN     "cantidad" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "nombresAlternativos" TEXT[],
ADD COLUMN     "precioCosto" DECIMAL(65,30),
ADD COLUMN     "tipoProducto" "TipoProducto" NOT NULL;

-- CreateTable
CREATE TABLE "HistorialProducto" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "accion" "AccionProducto" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realizadoPorId" INTEGER NOT NULL,

    CONSTRAINT "HistorialProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- AddForeignKey
ALTER TABLE "HistorialProducto" ADD CONSTRAINT "HistorialProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialProducto" ADD CONSTRAINT "HistorialProducto_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

