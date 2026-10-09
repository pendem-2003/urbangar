'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Property = {
  id: string
  title: string
  locality: string
  status: string
  monthlyRent: number | null
  salePrice: number | null
  listingFor: string
  bhk: number | null
  photos: string[]
  _count?: { views: number }
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-green-700 bg-green-100',
  PENDING_REVIEW: 'text-amber-700 bg-amber-100',
  DRAFT: 'text-gray-500 bg-gray-100',
  RENTED: 'text-blue-700 bg-blue-100',
  SOLD: 'text-purple-700 bg-purple-100',
  REJECTED: 'text-red-700 bg-red-100',
  INACTIVE: 'text-gray-500 bg-gray-100',
}

export default function BrokerListingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['broker-listings'],
    queryFn: async () => {
      const { data } = await api.get('/broker/listings')
      return data.data as Property[]
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-400">Properties assigned to you</p>
        </div>
        <Link
          href="/properties/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New listing
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      )}

      {!isLoading && !data?.length && (
        <div className="flex flex-col items-center py-20 text-center">
          <Building2 className="mb-3 h-12 w-12 text-gray-200" />
          <p className="font-medium text-gray-700">No listings yet</p>
          <p className="mt-1 text-sm text-gray-400">Properties assigned to you appear here</p>
        </div>
      )}

      {data?.length ? (
        <div className="space-y-3">
          {data.map((p) => <ListingRow key={p.id} property={p} />)}
        </div>
      ) : null}
    </div>
  )
}

function ListingRow({ property: p }: { property: Property }) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const price = p.listingFor === 'SALE' ? p.salePrice : p.monthlyRent

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/properties/${p.id}`)
      queryClient.invalidateQueries({ queryKey: ['broker-listings'] })
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {p.photos[0] ? (
            <img src={p.photos[0]} alt={p.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center"><Building2 className="h-6 w-6 text-gray-300" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">{p.title}</h3>
            <span className={cn('flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-500')}>
              {p.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-400">{p.locality}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {price ? `₹${price.toLocaleString('en-IN')}${p.listingFor !== 'SALE' ? '/mo' : ''}` : '—'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {p._count && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3.5 w-3.5" />{p._count.views}
            </span>
          )}
          <Link href={`/broker/properties/${p.id}/edit`} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <Link href={`/properties/${p.id}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            View
          </Link>
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
            Archive
          </button>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Archive listing?</h3>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">"{p.title}"</span> will be removed from search. All history is preserved.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Archiving…' : 'Yes, archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
