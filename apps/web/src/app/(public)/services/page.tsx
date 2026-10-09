'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Search, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: '', label: 'All services' },
  { value: 'COOK', label: 'Cook' },
  { value: 'MAID', label: 'Maid' },
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'HOME_CLEANING', label: 'Home Cleaning' },
  { value: 'PACKERS_MOVERS', label: 'Packers & Movers' },
  { value: 'LAUNDRY', label: 'Laundry' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'PHOTOGRAPHER', label: 'Photographer' },
  { value: 'INTERIOR_DESIGNER', label: 'Interior Designer' },
  { value: 'ARCHITECT', label: 'Architect' },
]

type Provider = {
  id: string
  category: string
  bio: string
  rating: number
  reviewCount: number
  hourlyRate: number | null
  serviceAreas: string[]
  user: { id: string; name: string; avatarUrl: string | null }
}

export default function ServicesPage() {
  const { user } = useAuthStore()
  const [category, setCategory] = useState('')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['providers', category],
    queryFn: async () => {
      const { data } = await api.get('/marketplace/providers', { params: { category: category || undefined } })
      return data.data as Provider[]
    },
  })

  const book = useMutation({
    mutationFn: ({ providerProfileId }: { providerProfileId: string }) =>
      api.post('/marketplace/book', { providerProfileId, scheduledAt, notes }),
    onSuccess: () => {
      toast.success('Booking sent! Provider will confirm shortly.')
      setBookingId(null)
      setScheduledAt('')
      setNotes('')
    },
    onError: () => toast.error('Booking failed. Please try again.'),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-900">Home Services</h1>
          <p className="mt-1 text-sm text-gray-400">Find trusted cooks, maids, plumbers, and more in Hyderabad</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                category === c.value
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />)}
          </div>
        )}

        {!isLoading && !data?.length && (
          <div className="py-20 text-center">
            <Search className="mx-auto mb-3 h-12 w-12 text-gray-200" />
            <p className="font-medium text-gray-700">No providers found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different category</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                    {p.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{p.user.name}</div>
                    <div className="text-xs text-gray-400">{p.category.replace('_', ' ')}</div>
                    {p.rating > 0 && (
                      <div className="mt-0.5 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-gray-700">{p.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({p.reviewCount})</span>
                      </div>
                    )}
                  </div>
                  {p.hourlyRate && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">₹{p.hourlyRate}/hr</div>
                    </div>
                  )}
                </div>

                {p.bio && <p className="mt-2 text-xs text-gray-500 line-clamp-2">{p.bio}</p>}

                {p.serviceAreas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.serviceAreas.slice(0, 3).map((a) => (
                      <span key={a} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{a}</span>
                    ))}
                  </div>
                )}

                {user && (
                  <button
                    onClick={() => setBookingId(p.id)}
                    className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Book
                  </button>
                )}
                {!user && (
                  <a
                    href="/login"
                    className="mt-3 block w-full rounded-lg border border-brand-600 py-2 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50"
                  >
                    Login to book
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking modal */}
      {bookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Book service</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date & time *</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any special requirements…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => book.mutate({ providerProfileId: bookingId })}
                disabled={!scheduledAt || book.isPending}
                className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {book.isPending ? 'Booking…' : 'Confirm booking'}
              </button>
              <button
                onClick={() => setBookingId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
