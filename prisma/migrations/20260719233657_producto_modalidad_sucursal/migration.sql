-- CreateTable
CREATE TABLE "ProductoModalidadSucursal" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "modalidad" "ModalidadVentaPaquete" NOT NULL,

    CONSTRAINT "ProductoModalidadSucursal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductoModalidadSucursal_productoId_sucursalId_key" ON "ProductoModalidadSucursal"("productoId", "sucursalId");

-- AddForeignKey
ALTER TABLE "ProductoModalidadSucursal" ADD CONSTRAINT "ProductoModalidadSucursal_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoModalidadSucursal" ADD CONSTRAINT "ProductoModalidadSucursal_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
