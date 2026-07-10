-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "unidadesPorCaja" INTEGER,
ADD COLUMN     "unidadesPorPaquete" INTEGER,
ADD COLUMN     "ventaSoloPorPaquete" BOOLEAN NOT NULL DEFAULT false;

