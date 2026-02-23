-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'text';
ALTER TYPE "ContentType" ADD VALUE 'image';
ALTER TYPE "ContentType" ADD VALUE 'video';
ALTER TYPE "ContentType" ADD VALUE 'audio';
ALTER TYPE "ContentType" ADD VALUE 'storyline';
ALTER TYPE "ContentType" ADD VALUE 'outline';

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "default_models" JSONB NOT NULL DEFAULT '{}',
    "last_used_models" JSONB NOT NULL DEFAULT '{}',
    "model_parameters" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelParameters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelParameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_user_id_key" ON "UserPreferences"("user_id");

-- CreateIndex
CREATE INDEX "UserPreferences_user_id_idx" ON "UserPreferences"("user_id");

-- CreateIndex
CREATE INDEX "ModelParameters_user_id_content_type_idx" ON "ModelParameters"("user_id", "content_type");

-- CreateIndex
CREATE UNIQUE INDEX "ModelParameters_user_id_content_type_key" ON "ModelParameters"("user_id", "content_type");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelParameters" ADD CONSTRAINT "ModelParameters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
