-- AlterTable
ALTER TABLE "AIProviderModel" ADD COLUMN     "model_id" TEXT;

-- CreateIndex
CREATE INDEX "AIProviderModel_model_id_idx" ON "AIProviderModel"("model_id");
