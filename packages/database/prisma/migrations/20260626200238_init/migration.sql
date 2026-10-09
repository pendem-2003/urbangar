-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SEEKER', 'OWNER', 'BROKER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('FLAT', 'PG', 'HOSTEL', 'VILLA', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'RENTED', 'SOLD', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ListingFor" AS ENUM ('RENT', 'SALE', 'BOTH');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('MALE', 'FEMALE', 'ANY');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('VISIT', 'RENT_APPLICATION', 'BUY_INTENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'CLEANING', 'PAINTING', 'APPLIANCE', 'PEST_CONTROL', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MaintenancePaidBy" AS ENUM ('OWNER', 'TENANT', 'INCLUDED');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('COOK', 'MAID', 'SECURITY', 'LAUNDRY', 'CYLINDER', 'PACKERS_MOVERS', 'HOME_CLEANING', 'ELECTRICIAN', 'PLUMBER', 'ARCHITECT', 'INTERIOR_DESIGNER', 'PHOTOGRAPHER', 'VASTU', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "NudgeStatus" AS ENUM ('SENT', 'CLICKED', 'IGNORED', 'MUTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LISTING_APPROVED', 'LISTING_REJECTED', 'BROKER_ASSIGNED', 'BROKER_REASSIGNED', 'RENT_PAID', 'RENT_OVERDUE', 'PAYOUT_TRIGGERED', 'LEASE_CREATED', 'LEASE_TERMINATED', 'VERIFICATION_PASSED', 'VERIFICATION_FAILED', 'USER_ROLE_CHANGED', 'CONFIG_CHANGED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'NUDGE_SENT', 'CONTACT_REQUEST');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('HELD', 'PARTIALLY_RELEASED', 'RELEASED', 'FORFEITED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SEEKER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aadhaarNumber" TEXT,
    "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "otpHash" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reraNumber" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "serviceAreas" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeals" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "listingFor" "ListingFor" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Hyderabad',
    "locality" TEXT NOT NULL,
    "addressDisplay" TEXT NOT NULL,
    "addressFull" TEXT NOT NULL,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "monthlyRent" INTEGER,
    "salePrice" INTEGER,
    "depositMonths" INTEGER NOT NULL DEFAULT 2,
    "depositAmount" INTEGER,
    "maintenanceCharge" INTEGER DEFAULT 0,
    "bhk" INTEGER,
    "bathrooms" INTEGER,
    "totalAreaSqft" INTEGER,
    "carpetAreaSqft" INTEGER,
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "ageYears" INTEGER,
    "facing" TEXT,
    "furnishing" "FurnishingStatus" NOT NULL DEFAULT 'UNFURNISHED',
    "parkingAvailable" BOOLEAN NOT NULL DEFAULT false,
    "petFriendly" BOOLEAN NOT NULL DEFAULT false,
    "genderPreference" "GenderPreference" NOT NULL DEFAULT 'ANY',
    "totalBeds" INTEGER,
    "availableBeds" INTEGER,
    "mealsIncluded" BOOLEAN NOT NULL DEFAULT false,
    "mealDetails" TEXT,
    "photos" TEXT[],
    "videoUrl" TEXT,
    "floorPlanUrl" TEXT,
    "amenities" TEXT[],
    "rules" TEXT,
    "preferredTenants" TEXT,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "onboardingFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "onboardingFeeAmount" INTEGER,
    "onboardingPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pg_rooms" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "availableBeds" INTEGER NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "amenities" TEXT[],
    "photos" TEXT[],
    "genderPreference" "GenderPreference" NOT NULL DEFAULT 'ANY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pg_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_assignments" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "brokerProfileId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "commissionType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "dealsClosedCount" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "broker_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "brokerProfileId" TEXT,
    "type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "notes" TEXT,
    "cancelReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "brokerProfileId" TEXT,
    "status" "LeaseStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "depositStatus" "DepositStatus" NOT NULL DEFAULT 'HELD',
    "depositPaymentId" TEXT,
    "depositVirtualAccId" TEXT,
    "agreementUrl" TEXT,
    "tenantSignedAt" TIMESTAMP(3),
    "ownerSignedAt" TIMESTAMP(3),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "verificationReportUrl" TEXT,
    "onGridRequestId" TEXT,
    "terminationReason" TEXT,
    "terminatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpayRouteId" TEXT,
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "ownerPayout" INTEGER NOT NULL DEFAULT 0,
    "brokerPayout" INTEGER NOT NULL DEFAULT 0,
    "ownerSettledAt" TIMESTAMP(3),
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "category" "MaintenanceCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[],
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "paidBy" "MaintenancePaidBy" NOT NULL DEFAULT 'OWNER',
    "assignedProviderId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "resolutionPhotos" TEXT[],
    "estimatedCost" INTEGER,
    "actualCost" INTEGER,
    "paymentId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "tenantRating" INTEGER,
    "tenantReview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "subcategory" TEXT,
    "bio" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "hourlyRate" INTEGER,
    "packageDetails" TEXT,
    "areasServed" TEXT[],
    "portfolioUrls" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bookings" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "propertyId" TEXT,
    "category" "ServiceCategory" NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "ServiceBookingStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER,
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "providerPayout" INTEGER NOT NULL DEFAULT 0,
    "razorpayPaymentId" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "seekerRating" INTEGER,
    "seekerReview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_reviews" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_views" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "source" TEXT,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_nudges" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" "NudgeStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedAt" TIMESTAMP(3),
    "mutedAt" TIMESTAMP(3),

    CONSTRAINT "lead_nudges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_properties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" "Role",
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "label" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_profiles_userId_key" ON "broker_profiles"("userId");

-- CreateIndex
CREATE INDEX "properties_locality_idx" ON "properties"("locality");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "properties_listingFor_idx" ON "properties"("listingFor");

-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE INDEX "pg_rooms_propertyId_idx" ON "pg_rooms"("propertyId");

-- CreateIndex
CREATE INDEX "broker_assignments_propertyId_idx" ON "broker_assignments"("propertyId");

-- CreateIndex
CREATE INDEX "broker_assignments_brokerProfileId_idx" ON "broker_assignments"("brokerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_assignments_propertyId_brokerProfileId_key" ON "broker_assignments"("propertyId", "brokerProfileId");

-- CreateIndex
CREATE INDEX "bookings_seekerId_idx" ON "bookings"("seekerId");

-- CreateIndex
CREATE INDEX "bookings_propertyId_idx" ON "bookings"("propertyId");

-- CreateIndex
CREATE INDEX "bookings_brokerProfileId_idx" ON "bookings"("brokerProfileId");

-- CreateIndex
CREATE INDEX "leases_propertyId_idx" ON "leases"("propertyId");

-- CreateIndex
CREATE INDEX "leases_tenantId_idx" ON "leases"("tenantId");

-- CreateIndex
CREATE INDEX "rent_payments_leaseId_idx" ON "rent_payments"("leaseId");

-- CreateIndex
CREATE INDEX "rent_payments_tenantId_idx" ON "rent_payments"("tenantId");

-- CreateIndex
CREATE INDEX "rent_payments_dueDate_idx" ON "rent_payments"("dueDate");

-- CreateIndex
CREATE INDEX "rent_payments_status_idx" ON "rent_payments"("status");

-- CreateIndex
CREATE INDEX "maintenance_requests_propertyId_idx" ON "maintenance_requests"("propertyId");

-- CreateIndex
CREATE INDEX "maintenance_requests_tenantId_idx" ON "maintenance_requests"("tenantId");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_userId_key" ON "provider_profiles"("userId");

-- CreateIndex
CREATE INDEX "provider_profiles_category_idx" ON "provider_profiles"("category");

-- CreateIndex
CREATE INDEX "provider_profiles_areasServed_idx" ON "provider_profiles"("areasServed");

-- CreateIndex
CREATE INDEX "service_bookings_providerId_idx" ON "service_bookings"("providerId");

-- CreateIndex
CREATE INDEX "service_bookings_seekerId_idx" ON "service_bookings"("seekerId");

-- CreateIndex
CREATE INDEX "provider_reviews_providerId_idx" ON "provider_reviews"("providerId");

-- CreateIndex
CREATE INDEX "property_views_propertyId_idx" ON "property_views"("propertyId");

-- CreateIndex
CREATE INDEX "property_views_userId_idx" ON "property_views"("userId");

-- CreateIndex
CREATE INDEX "property_views_createdAt_idx" ON "property_views"("createdAt");

-- CreateIndex
CREATE INDEX "lead_nudges_propertyId_idx" ON "lead_nudges"("propertyId");

-- CreateIndex
CREATE INDEX "lead_nudges_seekerId_idx" ON "lead_nudges"("seekerId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_nudges_propertyId_seekerId_channel_key" ON "lead_nudges"("propertyId", "seekerId", "channel");

-- CreateIndex
CREATE INDEX "contact_requests_userId_idx" ON "contact_requests"("userId");

-- CreateIndex
CREATE INDEX "contact_requests_createdAt_idx" ON "contact_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "saved_properties_userId_propertyId_key" ON "saved_properties"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "platform_config_key_key" ON "platform_config"("key");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_profiles" ADD CONSTRAINT "broker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pg_rooms" ADD CONSTRAINT "pg_rooms_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_assignments" ADD CONSTRAINT "broker_assignments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_assignments" ADD CONSTRAINT "broker_assignments_brokerProfileId_fkey" FOREIGN KEY ("brokerProfileId") REFERENCES "broker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_brokerProfileId_fkey" FOREIGN KEY ("brokerProfileId") REFERENCES "broker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_brokerProfileId_fkey" FOREIGN KEY ("brokerProfileId") REFERENCES "broker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assignedProviderId_fkey" FOREIGN KEY ("assignedProviderId") REFERENCES "provider_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_reviews" ADD CONSTRAINT "provider_reviews_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_nudges" ADD CONSTRAINT "lead_nudges_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
