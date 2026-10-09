// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  SEEKER = 'SEEKER',
  OWNER = 'OWNER',
  BROKER = 'BROKER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export enum PropertyType {
  FLAT = 'FLAT',
  PG = 'PG',
  HOSTEL = 'HOSTEL',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  RENTED = 'RENTED',
  SOLD = 'SOLD',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

export enum ListingFor {
  RENT = 'RENT',
  SALE = 'SALE',
  BOTH = 'BOTH',
}

export enum FurnishingStatus {
  FULLY_FURNISHED = 'FULLY_FURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
}

export enum GenderPreference {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  ANY = 'ANY',
}

export enum BookingType {
  VISIT = 'VISIT',
  RENT_APPLICATION = 'RENT_APPLICATION',
  BUY_INTENT = 'BUY_INTENT',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum LeaseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  OVERDUE = 'OVERDUE',
}

export enum MaintenanceCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  CARPENTRY = 'CARPENTRY',
  CLEANING = 'CLEANING',
  PAINTING = 'PAINTING',
  APPLIANCE = 'APPLIANCE',
  PEST_CONTROL = 'PEST_CONTROL',
  OTHER = 'OTHER',
}

export enum MaintenanceStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum MaintenancePaidBy {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  INCLUDED = 'INCLUDED',
}

export enum ServiceCategory {
  COOK = 'COOK',
  MAID = 'MAID',
  SECURITY = 'SECURITY',
  LAUNDRY = 'LAUNDRY',
  CYLINDER = 'CYLINDER',
  PACKERS_MOVERS = 'PACKERS_MOVERS',
  HOME_CLEANING = 'HOME_CLEANING',
  ELECTRICIAN = 'ELECTRICIAN',
  PLUMBER = 'PLUMBER',
  ARCHITECT = 'ARCHITECT',
  INTERIOR_DESIGNER = 'INTERIOR_DESIGNER',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  VASTU = 'VASTU',
  OTHER = 'OTHER',
}

export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

export enum NudgeStatus {
  SENT = 'SENT',
  CLICKED = 'CLICKED',
  IGNORED = 'IGNORED',
  MUTED = 'MUTED',
}

export enum AuditAction {
  LISTING_APPROVED = 'LISTING_APPROVED',
  LISTING_REJECTED = 'LISTING_REJECTED',
  BROKER_ASSIGNED = 'BROKER_ASSIGNED',
  RENT_PAID = 'RENT_PAID',
  RENT_OVERDUE = 'RENT_OVERDUE',
  PAYOUT_TRIGGERED = 'PAYOUT_TRIGGERED',
  LEASE_CREATED = 'LEASE_CREATED',
  LEASE_TERMINATED = 'LEASE_TERMINATED',
  VERIFICATION_PASSED = 'VERIFICATION_PASSED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  CONFIG_CHANGED = 'CONFIG_CHANGED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
}

// ─── Shared interfaces (used across web + api) ────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface GeoPoint {
  lat: number
  lng: number
}

export interface PropertyFilters {
  type?: PropertyType
  listingFor?: ListingFor
  locality?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minDeposit?: number
  maxDeposit?: number
  bhk?: number[]
  minBhk?: number
  furnishing?: FurnishingStatus[]
  genderPreference?: GenderPreference
  petFriendly?: boolean
  amenities?: string[]
  lat?: number
  lng?: number
  radiusKm?: number
  page?: number
  limit?: number
}

export interface PlatformConfig {
  onboardingFeeEnabled: boolean
  onboardingFeeAmount: number
  tenantFeeEnabled: boolean
  tenantFeeAmount: number
  rentCommissionEnabled: boolean
  rentCommissionPct: number
  verificationFeeEnabled: boolean
  verificationFeeAmount: number
  serviceBookingFeePct: number
  brokerDealCommissionPct: number
  maxContactRequestsPerDay: number
  nudgeDelayHours: number
  maxNudgesPerProperty: number
  nudgeCooldownHours: number
}
