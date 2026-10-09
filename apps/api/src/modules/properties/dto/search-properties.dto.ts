import {
  IsOptional, IsEnum, IsInt, IsBoolean, IsString,
  IsArray, IsNumber, Min, Max,
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { PropertyType, ListingFor, FurnishingStatus, GenderPreference } from '@urbangar/types'

export class SearchPropertiesDto {
  @IsString()
  @IsOptional()
  q?: string

  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType

  @IsEnum(ListingFor)
  @IsOptional()
  listingFor?: ListingFor

  @IsString()
  @IsOptional()
  locality?: string

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minPrice?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minDeposit?: number

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maxDeposit?: number

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]).map(Number).filter((n: number) => !isNaN(n)))
  bhk?: number[]

  @IsOptional()
  @Transform(({ value }) => Number(value))
  minBhk?: number

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  furnishing?: FurnishingStatus[]

  @IsEnum(GenderPreference)
  @IsOptional()
  genderPreference?: GenderPreference

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  petFriendly?: boolean

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  amenities?: string[]

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radiusKm?: number

  @IsString()
  @IsOptional()
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'area_desc'

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 20
}
