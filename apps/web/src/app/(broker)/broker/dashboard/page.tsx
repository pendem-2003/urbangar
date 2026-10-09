'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, Users, Bell, TrendingUp, Eye } from 'lucide-react'

export default function BrokerDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['broker-stats'],
    queryFn: async () => {
      const { data } = await api.get('/broker/stats')
      return data.data
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Broker Dashboard</h1>
        <p className="text-sm text-gray-400">Your listings and lead performance</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Active listings" value={stats?.activeListings ?? 0} color="brand" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total leads" value={stats?.totalLeads ?? 0} color="blue" />
        <StatCard icon={<Bell className="h-5 w-5" />} label="Interested (no contact)" value={stats?.nudgePending ?? 0} color="amber" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Deals closed" value={stats?.dealsClosed ?? 0} color="green" />
      </div>

      {/* Recent lead nudges */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent interested leads</h2>
          <a href="/broker/nudges" className="text-xs text-brand-600 hover:underline">View all →</a>
        </div>
        <RecentNudges />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
      <div className={`rounded-lg p-2.5 ${colorMap[color] ?? colorMap['brand']}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
}

function RecentNudges() {
  const { data, isLoading } = useQuery({
    queryKey: ['broker-nudges', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/broker/nudges?limit=5')
      return data.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (!data?.items?.length) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Eye className="mb-2 h-8 w-8 text-gray-200" />
        <p className="text-sm text-gray-400">No interested leads yet</p>
        <p className="text-xs text-gray-300">When users view your listings without contacting, they appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.items.map((nudge: { id: string; user: { id: string; name: string; phone: string }; property: { id: string; title: string }; viewCount: number; createdAt: string }) => (
        <NudgeRow key={nudge.id} nudge={nudge} />
      ))}
    </div>
  )
}

function NudgeRow({ nudge }: { nudge: { id: string; user: { id: string; name: string; phone: string }; property: { id: string; title: string }; viewCount: number; createdAt: string } }) {
  const handleNudge = async () => {
    await api.post('/broker/nudges/send', { propertyId: nudge.property.id, seekerId: nudge.user.id })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-50 p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
          {nudge.user.name?.charAt(0) ?? '?'}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{nudge.user.name}</div>
          <div className="text-xs text-gray-400">
            Viewed "{nudge.property.title}" {nudge.viewCount}× · No contact
          </div>
        </div>
      </div>
      <button
        onClick={handleNudge}
        className="shrink-0 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
      >
        Send nudge
      </button>
    </div>
  )
}
