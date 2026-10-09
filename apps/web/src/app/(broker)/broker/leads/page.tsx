'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Search, Phone, MessageSquare, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type LeadStatus = 'ALL' | 'NEW' | 'CONTACTED' | 'VISIT_SCHEDULED' | 'CONVERTED' | 'LOST'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  CONTACTED: 'bg-yellow-50 text-yellow-700',
  VISIT_SCHEDULED: 'bg-purple-50 text-purple-700',
  CONVERTED: 'bg-green-50 text-green-700',
  LOST: 'bg-gray-50 text-gray-500',
}

export default function BrokerLeadsPage() {
  const [status, setStatus] = useState<LeadStatus>('ALL')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['broker-leads', status, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status !== 'ALL') params.set('status', status)
      if (search) params.set('q', search)
      const { data } = await api.get(`/broker/leads?${params}`)
      return data.data
    },
  })

  const leads: {
    id: string
    user: { name: string; phone: string }
    property: { id: string; title: string; locality: string }
    status: string
    lastContact: string | null
    notes: string | null
    createdAt: string
  }[] = data?.items ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Leads & CRM</h1>
        <p className="text-sm text-gray-400">Track all your property inquiries</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or property..."
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {(['ALL', 'NEW', 'CONTACTED', 'VISIT_SCHEDULED', 'CONVERTED', 'LOST'] as LeadStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                status === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {isLoading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse border-b border-gray-50 bg-gray-50" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Filter className="mb-2 h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-400">
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function LeadRow({ lead }: { lead: {
  id: string
  user: { name: string; phone: string }
  property: { id: string; title: string; locality: string }
  status: string
  lastContact: string | null
  notes: string | null
  createdAt: string
}}) {
  const statusColor = STATUS_COLORS[lead.status] ?? 'bg-gray-50 text-gray-500'

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{lead.user.name}</div>
        <div className="text-xs text-gray-400">{lead.user.phone}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-gray-700 line-clamp-1 max-w-[180px]">{lead.property.title}</div>
        <div className="text-xs text-gray-400">{lead.property.locality}</div>
      </td>
      <td className="px-4 py-3">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusColor)}>
          {lead.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            title="Call"
          >
            <Phone className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            title="Message"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
