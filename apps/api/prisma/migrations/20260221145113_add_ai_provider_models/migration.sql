-- CreateTable
CREATE TABLE "AIProviderModel" (
    "id" UUID NOT NULL,
    "ai_provider_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProviderModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIProviderModel_ai_provider_id_idx" ON "AIProviderModel"("ai_provider_id");

-- CreateIndex
CREATE INDEX "AIProviderModel_type_idx" ON "AIProviderModel"("type");

-- AddForeignKey
ALTER TABLE "AIProviderModel" ADD CONSTRAINT "AIProviderModel_ai_provider_id_fkey" FOREIGN KEY ("ai_provider_id") REFERENCES "AIProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
