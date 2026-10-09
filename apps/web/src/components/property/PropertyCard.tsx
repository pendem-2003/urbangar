'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Maximize } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPricePerMonth, formatPrice, cn } from '@/lib/utils'
import { useState } from 'react'

interface PropertyCardProps {
  id: string
  title: string
  type: string
  listingFor: string
  locality: string
  monthlyRent: number | null
  salePrice: number | null
  depositAmount: number | null
  bhk: number | null
  bathrooms: number | null
  totalAreaSqft: number | null
  furnishing: string
  photos: string[]
  amenities: string[]
  genderPreference?: string
  mealsIncluded?: boolean
  saved?: boolean
  onToggleSave?: (id: string) => void
}

export function PropertyCard({
  id, title, type, listingFor, locality, monthlyRent, salePrice,
  depositAmount, bhk, bathrooms, totalAreaSqft, furnishing, photos,
  amenities, genderPreference, mealsIncluded, saved = false, onToggleSave,
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(saved)
  const displayPhoto = photos[0] ?? '/placeholder-property.jpg'
  const isPG = type === 'PG' || type === 'HOSTEL'
  const price = listingFor === 'SALE' ? salePrice : monthlyRent

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSaved(!isSaved)
    onToggleSave?.(id)
  }

  return (
    <Link href={`/properties/${id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card transition-all duration-200 group-hover:shadow-card-hover group-hover:-translate-y-0.5">
        {/* Photo */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <Image
            src={displayPhoto}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge variant={listingFor === 'RENT' ? 'default' : 'secondary'}>
              {listingFor === 'RENT' ? 'Rent' : 'Sale'}
            </Badge>
            {isPG && genderPreference !== 'ANY' && (
              <Badge variant="outline" className="bg-white/90 text-gray-700">
                {genderPreference === 'MALE' ? '♂ Boys' : '♀ Girls'}
              </Badge>
            )}
          </div>
          {/* Save button */}
          <button
            onClick={handleSave}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110"
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            <Heart
              className={cn('h-4 w-4 transition-colors', isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400')}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
              {title}
            </h3>
          </div>

          <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" />
            <span className="truncate">{locality}, Hyderabad</span>
          </div>

          {/* Specs */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-gray-500">
            {bhk && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {bhk} BHK
              </span>
            )}
            {bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {bathrooms} Bath
              </span>
            )}
            {totalAreaSqft && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" /> {totalAreaSqft} sqft
              </span>
            )}
            {mealsIncluded && (
              <span className="flex items-center gap-1 text-green-600">
                <span>🍽</span> Meals included
              </span>
            )}
          </div>

          {/* Furnishing badge */}
          <div className="mb-3">
            <Badge variant="secondary" className="text-[11px]">
              {furnishing.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
            </Badge>
          </div>

          {/* Price + CTA */}
          <div className="flex items-end justify-between border-t border-gray-50 pt-3">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {price ? (listingFor === 'SALE' ? formatPrice(price) : formatPricePerMonth(price)) : 'Price on request'}
              </div>
              {depositAmount && listingFor === 'RENT' && (
                <div className="text-xs text-gray-400">
                  + {formatPrice(depositAmount)} deposit
                </div>
              )}
            </div>
            <Button size="sm" variant="outline" className="shrink-0 text-xs">
              View details
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
