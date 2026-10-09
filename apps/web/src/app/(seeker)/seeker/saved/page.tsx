'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Heart, Building2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type SavedProperty = {
  id: string
  propertyId: string
  property: {
    id: string
    title: string
    locality: string
    monthlyRent: number | null
    salePrice: number | null
    listingFor: string
    bhk: number | null
    photos: string[]
    furnishing: string
  }
}

export default function SeekerSavedPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['seeker-saved'],
    queryFn: async () => {
      const { data } = await api.get('/users/me/saved')
      return data.data as SavedProperty[]
    },
  })

  const unsave = useMutation({
    mutationFn: (propertyId: string) => api.post(`/properties/${propertyId}/save`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seeker-saved'] }),
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Saved Properties</h1>
        <p className="text-sm text-gray-400">Your shortlisted properties</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      )}

      {!isLoading && !data?.length && (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart className="mb-3 h-12 w-12 text-gray-200" />
          <p className="font-medium text-gray-700">No saved properties</p>
          <p className="mt-1 text-sm text-gray-400">Browse listings and click the heart to save</p>
          <Link href="/properties" className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Browse properties
          </Link>
        </div>
      )}

      {data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => {
            const p = s.property
            const price = p.listingFor === 'SALE' ? p.salePrice : p.monthlyRent
            return (
              <div key={s.id} className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
                <div className="relative h-44 bg-gray-100">
                  {p.photos[0] ? (
                    <img src={p.photos[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building2 className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => unsave.mutate(p.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-3">
                  <Link href={`/properties/${p.id}`}>
                    <h3 className="truncate text-sm font-semibold text-gray-900 hover:text-brand-600">{p.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-400">{p.locality}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      {price ? `₹${price.toLocaleString('en-IN')}${p.listingFor !== 'SALE' ? '/mo' : ''}` : '—'}
                    </span>
                    {p.bhk && <span className="text-xs text-gray-400">{p.bhk} BHK</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
