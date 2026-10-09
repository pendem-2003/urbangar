/*
  Warnings:

  - You are about to drop the column `aadhaarNumber` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,propertyId]` on the table `contact_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "contact_requests_userId_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "aadhaarNumber";

-- CreateIndex
CREATE UNIQUE INDEX "contact_requests_userId_propertyId_key" ON "contact_requests"("userId", "propertyId");
