-- CreateTable
CREATE TABLE "ModelUsage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "content_type" "ContentType" NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "response_time" INTEGER NOT NULL,
    "tokens_used" INTEGER,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelUsage_user_id_model_id_idx" ON "ModelUsage"("user_id", "model_id");

-- CreateIndex
CREATE INDEX "ModelUsage_user_id_content_type_idx" ON "ModelUsage"("user_id", "content_type");

-- CreateIndex
CREATE INDEX "ModelUsage_created_at_idx" ON "ModelUsage"("created_at");

-- CreateIndex
CREATE INDEX "ModelUsage_model_id_created_at_idx" ON "ModelUsage"("model_id", "created_at");
