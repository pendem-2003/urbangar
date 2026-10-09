'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Heart, FileText, CreditCard, Bell } from 'lucide-react'
import Link from 'next/link'

export default function SeekerDashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ['seeker-summary'],
    queryFn: async () => {
      const { data } = await api.get('/seeker/summary')
      return data.data
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-400">Your property search and lease overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Heart />} label="Saved properties" value={summary?.savedProperties ?? 0} color="brand" href="/seeker/saved" />
        <StatCard icon={<FileText />} label="Active lease" value={summary?.activeLease ? 'Active' : 'None'} color="green" href="/seeker/lease" />
        <StatCard icon={<CreditCard />} label="Next rent due" value={summary?.nextRentDue ?? '—'} color="blue" href="/seeker/payments" />
        <StatCard icon={<Bell />} label="Notifications" value={summary?.unreadNotifications ?? 0} color="amber" href="/seeker/notifications" />
      </div>

      {/* Saved properties quick view */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recently saved</h2>
          <Link href="/seeker/saved" className="text-xs text-brand-600 hover:underline">View all →</Link>
        </div>
        <p className="text-sm text-gray-400">
          Your shortlisted properties will appear here. Browse listings and click the heart icon to save.
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, href }: { icon: React.ReactNode; label: string; value: number | string; color: string; href: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md">
        <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
      </div>
    </Link>
  )
}
