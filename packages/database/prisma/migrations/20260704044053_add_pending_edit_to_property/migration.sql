-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "hasPendingEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingUpdate" JSONB;
