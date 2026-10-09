import {
  IsString, IsEnum, IsOptional, IsInt, IsBoolean,
  IsArray, IsNumber, Min, MaxLength, IsLatitude, IsLongitude,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PropertyType, ListingFor, FurnishingStatus, GenderPreference } from '@urbangar/types'

// Same as CreatePropertyDto but every field is optional (for PATCH)
export class UpdatePropertyDto {
  @IsEnum(PropertyType) @IsOptional() type?: PropertyType
  @IsEnum(ListingFor) @IsOptional() listingFor?: ListingFor
  @IsString() @MaxLength(120) @IsOptional() title?: string
  @IsString() @MaxLength(2000) @IsOptional() description?: string
  @IsString() @IsOptional() locality?: string
  @IsString() @IsOptional() addressDisplay?: string
  @IsString() @IsOptional() addressFull?: string
  @IsString() @IsOptional() pincode?: string
  @IsLatitude() @Type(() => Number) @IsOptional() latitude?: number
  @IsLongitude() @Type(() => Number) @IsOptional() longitude?: number
  @IsInt() @Min(0) @Type(() => Number) @IsOptional() monthlyRent?: number
  @IsInt() @Min(0) @Type(() => Number) @IsOptional() salePrice?: number
  @IsInt() @Min(1) @Type(() => Number) @IsOptional() depositMonths?: number
  @IsInt() @Min(0) @Type(() => Number) @IsOptional() depositAmount?: number
  @IsInt() @Min(0) @Type(() => Number) @IsOptional() maintenanceCharge?: number
  @IsInt() @Min(1) @Type(() => Number) @IsOptional() bhk?: number
  @IsInt() @Min(1) @Type(() => Number) @IsOptional() bathrooms?: number
  @IsInt() @Min(0) @Type(() => Number) @IsOptional() totalAreaSqft?: number
  @IsInt() @Type(() => Number) @IsOptional() floorNumber?: number
  @IsInt() @Type(() => Number) @IsOptional() totalFloors?: number
  @IsInt() @Min(0) @Type(() => Number) @IsOptional() ageYears?: number
  @IsString() @IsOptional() facing?: string
  @IsEnum(FurnishingStatus) @IsOptional() furnishing?: FurnishingStatus
  @IsBoolean() @IsOptional() parkingAvailable?: boolean
  @IsBoolean() @IsOptional() petFriendly?: boolean
  @IsEnum(GenderPreference) @IsOptional() genderPreference?: GenderPreference
  @IsInt() @Type(() => Number) @IsOptional() totalBeds?: number
  @IsInt() @Type(() => Number) @IsOptional() availableBeds?: number
  @IsBoolean() @IsOptional() mealsIncluded?: boolean
  @IsString() @IsOptional() mealDetails?: string
  @IsArray() @IsString({ each: true }) @IsOptional() amenities?: string[]
  @IsString() @IsOptional() rules?: string
  @IsString() @IsOptional() preferredTenants?: string
  @IsString() @IsOptional() videoUrl?: string
}
