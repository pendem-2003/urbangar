export const HYDERABAD_LOCALITIES = [
  'Banjara Hills',
  'Jubilee Hills',
  'Madhapur',
  'Gachibowli',
  'Kondapur',
  'Hitech City',
  'Kukatpally',
  'Miyapur',
  'Manikonda',
  'Nanakramguda',
  'Financial District',
  'Kokapet',
  'Narsingi',
  'Puppalaguda',
  'Tellapur',
  'Bachupally',
  'Nizampet',
  'Kompally',
  'Alwal',
  'Secunderabad',
  'Begumpet',
  'Somajiguda',
  'Ameerpet',
  'SR Nagar',
  'Dilsukhnagar',
  'LB Nagar',
  'Uppal',
  'Hayathnagar',
  'Boduppal',
  'Pocharam',
  'Shamshabad',
  'Rajendranagar',
  'Attapur',
  'Mehdipatnam',
  'Tolichowki',
  'Masab Tank',
  'Himayatnagar',
  'Narayanguda',
  'Musheerabad',
  'Moosapet',
] as const

export type HyderabadLocality = (typeof HYDERABAD_LOCALITIES)[number]

export const PROPERTY_AMENITIES = [
  'Power Backup',
  'Lift',
  'Security',
  'CCTV',
  'Parking',
  'Gym',
  'Swimming Pool',
  'Club House',
  'Children Play Area',
  'Garden',
  'Intercom',
  'Water 24/7',
  'Gas Pipeline',
  'Internet',
  'Gated Community',
  'Visitor Parking',
  'Maintenance Staff',
  'Fire Safety',
] as const

export const PG_AMENITIES = [
  'WiFi',
  'AC',
  'Geyser',
  'Laundry',
  'Meals',
  'Housekeeping',
  'Parking',
  'Security',
  'CCTV',
  'Recreation Room',
  'Study Room',
  'Fridge',
  'Washing Machine',
  'Power Backup',
  'RO Water',
] as const

export const DEFAULT_PLATFORM_CONFIG = {
  onboardingFeeEnabled: false,
  onboardingFeeAmount: 999,
  tenantFeeEnabled: false,
  tenantFeeAmount: 0,
  rentCommissionEnabled: true,
  rentCommissionPct: 2,
  verificationFeeEnabled: true,
  verificationFeeAmount: 500,
  serviceBookingFeePct: 10,
  brokerDealCommissionPct: 50,
  maxContactRequestsPerDay: 5,
  nudgeDelayHours: 2,
  maxNudgesPerProperty: 2,
  nudgeCooldownHours: 24,
} as const

export const JWT_EXPIRY = {
  ACCESS: '15m',
  REFRESH: '30d',
} as const

export const OTP_EXPIRY_SECONDS = 300

export const PROPERTY_PHOTO_LIMIT = 20

export const MAP_BLUR_RADIUS_KM = 0.5
