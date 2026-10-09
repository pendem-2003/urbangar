import {
  IsString, IsEnum, IsOptional, IsInt, IsBoolean,
  IsArray, IsNumber, Min, MaxLength, IsLatitude, IsLongitude,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PropertyType, ListingFor, FurnishingStatus, GenderPreference } from '@urbangar/types'

export class CreatePropertyDto {
  @IsEnum(PropertyType)
  type: PropertyType

  @IsEnum(ListingFor)
  listingFor: ListingFor

  @IsString()
  @MaxLength(120)
  title: string

  @IsString()
  @MaxLength(2000)
  description: string

  @IsString()
  locality: string

  @IsString()
  addressDisplay: string

  @IsString()
  addressFull: string

  @IsString()
  @IsOptional()
  pincode?: string

  @IsLatitude()
  @Type(() => Number)
  latitude: number

  @IsLongitude()
  @Type(() => Number)
  longitude: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  monthlyRent?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  salePrice?: number

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  depositMonths?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  depositAmount?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maintenanceCharge?: number

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  bhk?: number

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  bathrooms?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  totalAreaSqft?: number

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  floorNumber?: number

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  totalFloors?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  ageYears?: number

  @IsString()
  @IsOptional()
  facing?: string

  @IsEnum(FurnishingStatus)
  @IsOptional()
  furnishing?: FurnishingStatus

  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean

  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean

  @IsEnum(GenderPreference)
  @IsOptional()
  genderPreference?: GenderPreference

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  totalBeds?: number

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  availableBeds?: number

  @IsBoolean()
  @IsOptional()
  mealsIncluded?: boolean

  @IsString()
  @IsOptional()
  mealDetails?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[]

  @IsString()
  @IsOptional()
  rules?: string

  @IsString()
  @IsOptional()
  preferredTenants?: string

  @IsString()
  @IsOptional()
  videoUrl?: string
}
