-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_sucursalId_fkey";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "sucursalId";

