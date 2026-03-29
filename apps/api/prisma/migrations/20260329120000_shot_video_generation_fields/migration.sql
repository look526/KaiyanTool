-- AlterTable
ALTER TABLE "Shot" ADD COLUMN "video_generation_mode" TEXT NOT NULL DEFAULT 'end_frame';
ALTER TABLE "Shot" ADD COLUMN "video_prompt_flags" JSONB;
ALTER TABLE "Shot" ADD COLUMN "generation_prompt_json" JSONB;
