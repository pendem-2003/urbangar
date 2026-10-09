'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PropertyCard } from '@/components/property/PropertyCard'
import { FiltersSidebar } from '@/components/property/FiltersSidebar'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, LayoutGrid, List, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PropertyFilters } from '@urbangar/types'

function buildQueryString(filters: PropertyFilters): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      if (Array.isArray(v)) {
        v.forEach((item) => params.append(k, String(item)))
      } else {
        params.set(k, String(v))
      }
    }
  })
  return params.toString()
}

export function PropertySearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const rawMinPrice = searchParams.get('minPrice')
  const rawMaxPrice = searchParams.get('maxPrice')

  const filters: PropertyFilters = {
    locality: searchParams.get('locality') ?? undefined,
    type: (searchParams.get('type') as PropertyFilters['type']) ?? undefined,
    listingFor: (searchParams.get('listingFor') as PropertyFilters['listingFor']) ?? undefined,
    // Use !== null so '0' is parsed as 0 instead of undefined
    minPrice: rawMinPrice !== null ? Number(rawMinPrice) : undefined,
    maxPrice: rawMaxPrice !== null ? Number(rawMaxPrice) : undefined,
    bhk: searchParams.get('bhk')?.split(',').map(Number).filter(Boolean) ?? [],
    furnishing: (searchParams.get('furnishing')?.split(',').filter(Boolean) ?? []) as any,
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const { data } = await api.get(`/properties?${buildQueryString(filters)}`)
      return data.data
    },
    placeholderData: (prev) => prev,
  })

  const properties = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== undefined && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/properties?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  // Batch update — applies all key/value pairs in a single router.push so they don't race
  const batchUpdateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          params.set(k, v)
        } else {
          params.delete(k)
        }
      })
      params.delete('page')
      router.push(`/properties?${params.toString()}`, { scroll: false })
    },
    [searchParams, router]
  )

  const heading = filters.locality
    ? `${filters.locality}, Hyderabad`
    : filters.listingFor === 'SALE'
    ? 'Properties for sale in Hyderabad'
    : 'Flats & PGs for rent in Hyderabad'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search strip */}
      <div className="sticky top-16 z-40 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-gray-900">{heading}</h1>
            <p className="text-xs text-gray-500">
              {isLoading ? 'Searching...' : `${total.toLocaleString()} properties found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            <div className="hidden items-center rounded-lg border border-gray-200 p-0.5 sm:flex">
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    viewMode === mode ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  {mode === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Filters sidebar (desktop) */}
        <aside className={cn('hidden w-64 shrink-0 lg:block', showFilters && '!block')}>
          <FiltersSidebar filters={filters} onUpdate={updateFilter} onBatchUpdate={batchUpdateFilters} />
        </aside>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="relative ml-auto flex h-full w-80 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-semibold text-gray-900">Filters</span>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FiltersSidebar filters={filters} onUpdate={updateFilter} onBatchUpdate={batchUpdateFilters} />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={cn('grid gap-4', viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MapPin className="mb-4 h-12 w-12 text-gray-200" />
              <h2 className="text-lg font-semibold text-gray-700">No properties found</h2>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your filters or search a different area</p>
              <Button variant="outline" size="md" className="mt-4" onClick={() => router.push('/properties')}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className={cn('grid gap-4', viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {properties.map((p: { id: string; title: string; type: string; listingFor: string; locality: string; monthlyRent: number | null; salePrice: number | null; depositAmount: number | null; bhk: number | null; bathrooms: number | null; totalAreaSqft: number | null; furnishing: string; photos: string[]; amenities: string[]; genderPreference?: string; mealsIncluded?: boolean }) => (
                  <PropertyCard key={p.id} {...p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() => updateFilter('page', String((filters.page ?? 1) - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {filters.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === totalPages}
                    onClick={() => updateFilter('page', String((filters.page ?? 1) + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
