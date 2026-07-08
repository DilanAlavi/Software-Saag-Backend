-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "precioCosto";

-- CreateTable
CREATE TABLE "Precio" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "precioCosto" DECIMAL(65,30) NOT NULL,
    "menor1" DECIMAL(65,30) NOT NULL,
    "menor2" DECIMAL(65,30) NOT NULL,
    "mayor1" DECIMAL(65,30) NOT NULL,
    "mayor2" DECIMAL(65,30) NOT NULL,
    "plomeria" DECIMAL(65,30) NOT NULL,
    "carpinteria" DECIMAL(65,30) NOT NULL,
    "electricista" DECIMAL(65,30) NOT NULL,
    "precioCaja" DECIMAL(65,30),
    "cantidadMinimaDescuentoMenor1" INTEGER,
    "precioDescuentoMenor1" DECIMAL(65,30),
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Precio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Precio_productoId_key" ON "Precio"("productoId");

-- AddForeignKey
ALTER TABLE "Precio" ADD CONSTRAINT "Precio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

