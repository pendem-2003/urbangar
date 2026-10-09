-- CreateIndex
CREATE INDEX "contact_requests_propertyId_idx" ON "contact_requests"("propertyId");

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
