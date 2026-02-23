/*
  Warnings:

  - You are about to drop the column `type` on the `AIProviderModel` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AIProviderModel_type_idx";

-- AlterTable
ALTER TABLE "AIProviderModel" DROP COLUMN "type",
ADD COLUMN     "types" TEXT[];
