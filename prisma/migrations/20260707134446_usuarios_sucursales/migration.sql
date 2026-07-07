-- CreateEnum
CREATE TYPE "TipoUbicacion" AS ENUM ('CENTRAL', 'SUCURSAL', 'DEPOSITO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR');

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoUbicacion" NOT NULL,
    "departamento" TEXT,
    "ciudad" TEXT,
    "zona" TEXT,
    "referencia" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "ci" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "genero" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucursalId" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_ci_key" ON "Usuario"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
