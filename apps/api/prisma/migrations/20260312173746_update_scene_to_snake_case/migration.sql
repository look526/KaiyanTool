/*
  Warnings:

  - You are about to drop the column `projectId` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `scriptId` on the `Scene` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_scriptId_fkey";

-- AlterTable
ALTER TABLE "Scene" DROP COLUMN "projectId",
DROP COLUMN "scriptId",
ADD COLUMN     "project_id" UUID,
ADD COLUMN     "script_id" UUID;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;
