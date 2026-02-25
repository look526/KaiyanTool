-- Migration: Add style and aspect ratio fields to Project
-- Date: 2026-02-25

-- Add aspectRatio field to Project model
ALTER TABLE "Project" ADD COLUMN "aspectRatio" TEXT DEFAULT '16:9';

-- Add style field to Project model
ALTER TABLE "Project" ADD COLUMN "style" TEXT DEFAULT 'cinematic';

-- Add customStyle field to Project model for custom style parameters
ALTER TABLE "Project" ADD COLUMN "customStyle" JSONB;

-- Create index for aspectRatio
CREATE INDEX "Project_aspectRatio_idx" ON "Project"("aspectRatio");

-- Create index for style
CREATE INDEX "Project_style_idx" ON "Project"("style");
