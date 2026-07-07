-- CreateEnum
CREATE TYPE "RolCliente" AS ENUM ('MAYOR_1', 'MAYOR_2', 'REGULAR', 'REGULAR_2', 'CARPINTERO', 'PLOMERO');

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "ci" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "ci" TEXT,
    "celular" TEXT NOT NULL,
    "genero" TEXT,
    "rol" "RolCliente" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucursalId" INTEGER,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_ci_key" ON "Cliente"("ci");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
