'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Calendar, Star, CheckCircle, Clock } from 'lucide-react'

type Booking = {
  id: string
  category: string
  scheduledAt: string
  status: string
  seeker: { name: string; phone: string }
}

export default function ProviderDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/marketplace/bookings/provider')
      return data.data as Booking[]
    },
  })

  const upcoming = data?.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED') ?? []
  const completed = data?.filter((b) => b.status === 'COMPLETED').length ?? 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Provider Dashboard</h1>
        <p className="text-sm text-gray-400">Your service bookings</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Clock className="h-4 w-4" /></div>
          <div><div className="text-xl font-bold text-gray-900">{upcoming.length}</div><div className="text-xs text-gray-400">Upcoming</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600"><CheckCircle className="h-4 w-4" /></div>
          <div><div className="text-xl font-bold text-gray-900">{completed}</div><div className="text-xs text-gray-400">Completed</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Star className="h-4 w-4" /></div>
          <div><div className="text-xl font-bold text-gray-900">—</div><div className="text-xs text-gray-400">Avg rating</div></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Upcoming bookings</h2>
        {isLoading && <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />)}</div>}
        {!isLoading && !upcoming.length && (
          <p className="py-8 text-center text-sm text-gray-400">No upcoming bookings</p>
        )}
        <div className="space-y-2">
          {upcoming.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-50 p-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{b.seeker.name}</div>
                <div className="text-xs text-gray-400">{b.seeker.phone} · {b.category.replace('_', ' ')}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-700">{new Date(b.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                <span className={`text-xs font-medium ${b.status === 'CONFIRMED' ? 'text-green-600' : 'text-amber-600'}`}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
