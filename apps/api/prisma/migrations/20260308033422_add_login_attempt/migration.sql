/*
  Warnings:

  - You are about to drop the column `model_id` on the `AIProviderModel` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `aspectRatio` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `customStyle` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `ModelUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_project_id_fkey";

-- DropIndex
DROP INDEX "Project_aspectRatio_idx";

-- DropIndex
DROP INDEX "Project_style_idx";

-- AlterTable
ALTER TABLE "AIProviderModel" DROP COLUMN "model_id";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "mimeType",
DROP COLUMN "name",
DROP COLUMN "size",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "category" TEXT DEFAULT 'general',
ADD COLUMN     "source" TEXT DEFAULT 'upload';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "aspectRatio",
DROP COLUMN "customStyle",
DROP COLUMN "style";

-- DropTable
DROP TABLE "ModelUsage";

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "project_id" UUID,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "category" TEXT,
    "default_value" TEXT NOT NULL,
    "custom_value" TEXT,
    "parent_code" TEXT,
    "description" TEXT,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "locked_until" TIMESTAMP(3),
    "first_attempt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatSession_project_id_idx" ON "ChatSession"("project_id");

-- CreateIndex
CREATE INDEX "ChatSession_user_id_idx" ON "ChatSession"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_code_key" ON "PromptTemplate"("code");

-- CreateIndex
CREATE INDEX "PromptTemplate_category_idx" ON "PromptTemplate"("category");

-- CreateIndex
CREATE INDEX "PromptTemplate_project_id_idx" ON "PromptTemplate"("project_id");

-- CreateIndex
CREATE INDEX "PromptTemplate_type_idx" ON "PromptTemplate"("type");

-- CreateIndex
CREATE INDEX "PromptTemplate_user_id_idx" ON "PromptTemplate"("user_id");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifier_idx" ON "LoginAttempt"("identifier");

-- CreateIndex
CREATE INDEX "LoginAttempt_ip_idx" ON "LoginAttempt"("ip");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Asset_source_idx" ON "Asset"("source");

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTemplate" ADD CONSTRAINT "PromptTemplate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
