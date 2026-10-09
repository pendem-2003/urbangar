-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "depositReturnedAmount" INTEGER;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
