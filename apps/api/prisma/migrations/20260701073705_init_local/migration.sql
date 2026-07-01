-- AlterEnum
ALTER TYPE "AgentType" ADD VALUE 'production';

-- AlterTable
ALTER TABLE "Scene" ADD COLUMN     "reference_images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Shot" ADD COLUMN     "audio_duration" INTEGER,
ADD COLUMN     "audio_url" TEXT,
ADD COLUMN     "lip_sync_url" TEXT,
ADD COLUMN     "nine_grid_created_at" TIMESTAMP(3),
ADD COLUMN     "nine_grid_image_url" TEXT,
ADD COLUMN     "subtitle_text" TEXT;

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "image" TEXT,
    "description" TEXT,
    "prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "shot_id" UUID,
    "episode_id" UUID,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "speaker" TEXT,
    "voice_id" TEXT,
    "emotion" TEXT,
    "text" TEXT,
    "start_time" INTEGER,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtitle" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "episode_id" UUID NOT NULL,
    "entries" JSONB NOT NULL DEFAULT '[]',
    "format" TEXT NOT NULL DEFAULT 'srt',
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "style" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineProject" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "episode_id" UUID NOT NULL,
    "tracks" JSONB NOT NULL DEFAULT '[]',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "fps" INTEGER NOT NULL DEFAULT 30,
    "resolution" TEXT NOT NULL DEFAULT '1080x1920',
    "output_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceProfile" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "character_id" UUID,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "voice_id" TEXT NOT NULL,
    "sample_url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "gender" TEXT,
    "style" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionTask" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "episode_id" UUID,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_step" TEXT,
    "total_steps" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_log" JSONB,
    "output_url" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '默认工作台',
    "config" JSONB NOT NULL DEFAULT '{}',
    "snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasNode" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "position_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL DEFAULT '{}',
    "content" JSONB,
    "output_url" TEXT,
    "history" JSONB NOT NULL DEFAULT '[]',
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_starred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasEdge" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "source_node_id" UUID NOT NULL,
    "target_node_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanvasEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_project_id_idx" ON "Item"("project_id");

-- CreateIndex
CREATE INDEX "AudioTrack_project_id_idx" ON "AudioTrack"("project_id");

-- CreateIndex
CREATE INDEX "AudioTrack_shot_id_idx" ON "AudioTrack"("shot_id");

-- CreateIndex
CREATE INDEX "AudioTrack_episode_id_idx" ON "AudioTrack"("episode_id");

-- CreateIndex
CREATE INDEX "AudioTrack_type_idx" ON "AudioTrack"("type");

-- CreateIndex
CREATE INDEX "Subtitle_project_id_idx" ON "Subtitle"("project_id");

-- CreateIndex
CREATE INDEX "Subtitle_episode_id_idx" ON "Subtitle"("episode_id");

-- CreateIndex
CREATE INDEX "TimelineProject_project_id_idx" ON "TimelineProject"("project_id");

-- CreateIndex
CREATE INDEX "TimelineProject_episode_id_idx" ON "TimelineProject"("episode_id");

-- CreateIndex
CREATE INDEX "VoiceProfile_project_id_idx" ON "VoiceProfile"("project_id");

-- CreateIndex
CREATE INDEX "VoiceProfile_character_id_idx" ON "VoiceProfile"("character_id");

-- CreateIndex
CREATE INDEX "ProductionTask_project_id_idx" ON "ProductionTask"("project_id");

-- CreateIndex
CREATE INDEX "ProductionTask_episode_id_idx" ON "ProductionTask"("episode_id");

-- CreateIndex
CREATE INDEX "ProductionTask_status_idx" ON "ProductionTask"("status");

-- CreateIndex
CREATE INDEX "Workspace_user_id_idx" ON "Workspace"("user_id");

-- CreateIndex
CREATE INDEX "CanvasNode_workspace_id_idx" ON "CanvasNode"("workspace_id");

-- CreateIndex
CREATE INDEX "CanvasEdge_workspace_id_idx" ON "CanvasEdge"("workspace_id");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioTrack" ADD CONSTRAINT "AudioTrack_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineProject" ADD CONSTRAINT "TimelineProject_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceProfile" ADD CONSTRAINT "VoiceProfile_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionTask" ADD CONSTRAINT "ProductionTask_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasNode" ADD CONSTRAINT "CanvasNode_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasEdge" ADD CONSTRAINT "CanvasEdge_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
