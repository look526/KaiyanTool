import { prisma } from '../lib/prisma';

export async function createRenderTaskModels() {
  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "RenderTask" (
      "id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "progress" INTEGER NOT NULL DEFAULT 0,
      "priority" INTEGER NOT NULL DEFAULT 5,
      "prompt" TEXT,
      "params" JSONB,
      "logs" JSONB,
      "error" TEXT,
      "startedAt" TIMESTAMP(3),
      "completedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "projectId" TEXT NOT NULL,
      "shotId" TEXT,
      CONSTRAINT "RenderTask_pkey" PRIMARY KEY ("id")
    );
  `;

  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "ScriptAnalysis" (
      "id" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "result" JSONB,
      "targetDuration" INTEGER,
      "status" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "projectId" TEXT NOT NULL,
      CONSTRAINT "ScriptAnalysis_pkey" PRIMARY KEY ("id")
    );
  `;

  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "VisualPrompt" (
      "id" TEXT NOT NULL,
      "sceneDescription" TEXT NOT NULL,
      "characters" TEXT[],
      "prompt" TEXT NOT NULL,
      "negativePrompt" TEXT,
      "aspectRatio" TEXT,
      "style" TEXT,
      "sceneImageId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "VisualPrompt_pkey" PRIMARY KEY ("id")
    );
  `;

  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "SceneConcept" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "prompt" TEXT,
      "consistencyScore" DOUBLE PRECISION,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "projectId" TEXT NOT NULL,
      CONSTRAINT "SceneConcept_pkey" PRIMARY KEY ("id")
    );
  `;

  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "CharacterReference" (
      "id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "prompt" TEXT NOT NULL,
      "metadata" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "characterId" TEXT NOT NULL,
      "imageId" TEXT NOT NULL,
      CONSTRAINT "CharacterReference_pkey" PRIMARY KEY ("id")
    );
  `;

  console.log('Render task models created successfully');
}
