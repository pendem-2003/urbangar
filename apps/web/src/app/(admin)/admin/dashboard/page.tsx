'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Building2, Users, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats')
      return data.data
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Platform overview and controls</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={stats?.totalUsers ?? 0} color="blue" />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Active listings" value={stats?.totalProperties ?? 0} color="brand" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending approval" value={stats?.pendingApprovals ?? 0} color="amber" href="/admin/approvals" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Active leases" value={stats?.activeLeases ?? 0} color="green" />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, href }: { icon: React.ReactNode; label: string; value: number; color: string; href?: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  }
  const card = (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md">
      <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}
