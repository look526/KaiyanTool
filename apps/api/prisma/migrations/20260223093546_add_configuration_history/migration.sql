-- CreateTable
CREATE TABLE "ConfigurationHistory" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "change_type" TEXT NOT NULL,
    "change_details" JSONB NOT NULL,
    "previous_value" JSONB,
    "new_value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfigurationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConfigurationHistory_user_id_idx" ON "ConfigurationHistory"("user_id");

-- CreateIndex
CREATE INDEX "ConfigurationHistory_user_id_created_at_idx" ON "ConfigurationHistory"("user_id", "created_at");
