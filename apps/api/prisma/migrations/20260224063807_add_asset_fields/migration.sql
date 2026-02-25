/*
  Warnings:

  - Added the required column `name` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
