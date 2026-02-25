/*
  Warnings:

  - You are about to drop the column `aspectRatio` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `customStyle` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Project` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Project_aspectRatio_idx";

-- DropIndex
DROP INDEX "Project_style_idx";

-- AlterTable
ALTER TABLE "AIProviderModel" ADD COLUMN     "model_id" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "aspectRatio",
DROP COLUMN "customStyle",
DROP COLUMN "style";
