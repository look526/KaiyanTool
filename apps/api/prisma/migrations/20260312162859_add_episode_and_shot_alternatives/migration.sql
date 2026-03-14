/*
  Warnings:

  - You are about to drop the column `atmosphere` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `project_id` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `reference_images` on the `Scene` table. All the data in the column will be lost.
  - You are about to drop the column `script_id` on the `Scene` table. All the data in the column will be lost.
  - Added the required column `episode_id` to the `Scene` table without a default value. This is not possible if the table is not empty.
  - Added the required column `episode_id` to the `Shot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Scene" DROP CONSTRAINT "Scene_script_id_fkey";

-- DropIndex
DROP INDEX "Scene_project_id_idx";

-- DropIndex
DROP INDEX "Scene_script_id_idx";

-- AlterTable
ALTER TABLE "Scene" DROP COLUMN "atmosphere",
DROP COLUMN "project_id",
DROP COLUMN "reference_images",
DROP COLUMN "script_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "episode_id" UUID NOT NULL,
ADD COLUMN     "projectId" UUID,
ADD COLUMN     "scene_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scriptId" UUID,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Shot" ADD COLUMN     "episode_id" UUID NOT NULL,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "resolution" TEXT NOT NULL DEFAULT '1080p',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "Episode" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "episode_number" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "script_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotAlternative" (
    "id" UUID NOT NULL,
    "shot_id" UUID NOT NULL,
    "video_url" TEXT NOT NULL,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShotAlternative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShotDraft" (
    "id" UUID NOT NULL,
    "shot_id" UUID,
    "episode_id" UUID NOT NULL,
    "scene_id" TEXT,
    "draft_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShotDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Episode_project_id_idx" ON "Episode"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_project_id_episode_number_key" ON "Episode"("project_id", "episode_number");

-- CreateIndex
CREATE INDEX "ShotAlternative_shot_id_idx" ON "ShotAlternative"("shot_id");

-- CreateIndex
CREATE INDEX "ShotAlternative_shot_id_is_recommended_idx" ON "ShotAlternative"("shot_id", "is_recommended");

-- CreateIndex
CREATE INDEX "ShotDraft_episode_id_idx" ON "ShotDraft"("episode_id");

-- CreateIndex
CREATE INDEX "ShotDraft_shot_id_idx" ON "ShotDraft"("shot_id");

-- CreateIndex
CREATE INDEX "Scene_episode_id_idx" ON "Scene"("episode_id");

-- CreateIndex
CREATE INDEX "Scene_episode_id_scene_order_idx" ON "Scene"("episode_id", "scene_order");

-- CreateIndex
CREATE INDEX "Shot_episode_id_idx" ON "Shot"("episode_id");

-- CreateIndex
CREATE INDEX "Shot_episode_id_status_idx" ON "Shot"("episode_id", "status");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shot" ADD CONSTRAINT "Shot_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShotAlternative" ADD CONSTRAINT "ShotAlternative_shot_id_fkey" FOREIGN KEY ("shot_id") REFERENCES "Shot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShotDraft" ADD CONSTRAINT "ShotDraft_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShotDraft" ADD CONSTRAINT "ShotDraft_shot_id_fkey" FOREIGN KEY ("shot_id") REFERENCES "Shot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
