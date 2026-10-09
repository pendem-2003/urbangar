'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Wrench, Clock, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: 'urgent', color: 'text-white', bg: 'bg-red-500' },
  high: { label: 'high', color: 'text-white', bg: 'bg-gray-900' },
  medium: { label: 'medium', color: 'text-gray-700', bg: 'bg-gray-200' },
  normal: { label: 'normal', color: 'text-gray-700', bg: 'bg-gray-200' },
  low: { label: 'low', color: 'text-gray-700', bg: 'bg-gray-200' },
  URGENT: { label: 'urgent', color: 'text-white', bg: 'bg-red-500' },
  HIGH: { label: 'high', color: 'text-white', bg: 'bg-gray-900' },
  MEDIUM: { label: 'medium', color: 'text-gray-700', bg: 'bg-gray-200' },
  NORMAL: { label: 'normal', color: 'text-gray-700', bg: 'bg-gray-200' },
  LOW: { label: 'low', color: 'text-gray-700', bg: 'bg-gray-200' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'open', color: 'text-amber-700', bg: 'bg-amber-100' },
  OPEN: { label: 'open', color: 'text-amber-700', bg: 'bg-amber-100' },
  in_progress: { label: 'in progress', color: 'text-blue-700', bg: 'bg-blue-100' },
  IN_PROGRESS: { label: 'in progress', color: 'text-blue-700', bg: 'bg-blue-100' },
  ASSIGNED: { label: 'assigned', color: 'text-purple-700', bg: 'bg-purple-100' },
  completed: { label: 'completed', color: 'text-green-700', bg: 'bg-green-100' },
  COMPLETED: { label: 'completed', color: 'text-green-700', bg: 'bg-green-100' },
}

const SAMPLE_REQUESTS = [
  { id: '1', title: 'Water leakage in bathroom', priority: 'urgent', status: 'open', property: 'Green Valley PG', room: 'A-101', tenant: 'Rahul Sharma', category: 'Plumbing', assignedTo: 'Ramesh - Plumber', date: '20 Nov 2024' },
  { id: '2', title: 'AC not cooling properly', priority: 'high', status: 'in_progress', property: 'Sunrise Hostel', room: 'B-205', tenant: 'Priya Patel', category: 'Electrical', assignedTo: 'Suresh - AC Technician', date: '19 Nov 2024' },
  { id: '3', title: 'Bed frame repair needed', priority: 'medium', status: 'in_progress', property: 'Metro Stay Hostel', room: 'F-203', tenant: 'Anjali Mehta', category: 'Carpentry', assignedTo: 'Ravi - Carpenter', date: '19 Nov 2024' },
  { id: '4', title: 'Room deep cleaning required', priority: 'low', status: 'open', property: 'Green Valley PG', room: 'A-305', tenant: 'Rohan Desai', category: 'Housekeeping', assignedTo: 'Cleaning Staff', date: '18 Nov 2024' },
  { id: '5', title: 'Geyser not working', priority: 'urgent', status: 'open', property: 'Sunrise Hostel', room: 'B-110', tenant: 'Kavya Iyer', category: 'Electrical', assignedTo: 'Unassigned', date: '20 Nov 2024' },
]

const VENDORS = [
  { category: 'Plumbing', count: 5 },
  { category: 'Electrical', count: 5 },
  { category: 'Carpentry', count: 5 },
  { category: 'Cleaning', count: 5 },
]

export default function OwnerMaintenancePage() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['owner-maintenance'],
    queryFn: async () => {
      const { data } = await api.get('/maintenance/owner')
      return data.data
    },
  })

  const requests: any[] = Array.isArray(data) ? data : SAMPLE_REQUESTS

  const counts = {
    open: requests.filter((r) => ['OPEN', 'open'].includes(r.status)).length,
    inProgress: requests.filter((r) => ['IN_PROGRESS', 'in_progress', 'ASSIGNED'].includes(r.status)).length,
    completedToday: 12,
    urgent: requests.filter((r) => ['URGENT', 'urgent'].includes(r.priority)).length,
  }

  const { mutate: markComplete } = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/maintenance/${id}/complete`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-maintenance'] }),
  })

  const stats = [
    { label: 'Open Requests', value: counts.open, icon: Clock, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'In Progress', value: counts.inProgress, icon: Wrench, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Completed Today', value: counts.completedToday, icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Urgent', value: counts.urgent, icon: AlertTriangle, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all maintenance issues</p>
        </div>
        <Link href="/owner/maintenance/new" className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
          <Wrench className="h-4 w-4" />
          Create Request
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={cn('rounded-xl p-2', s.iconBg)}>
                  <Icon className={cn('h-4 w-4', s.iconColor)} />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold text-gray-900">{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {requests.map((r: any) => {
          const priority = PRIORITY_CONFIG[r.priority] ?? PRIORITY_CONFIG['medium']!
          const status = STATUS_CONFIG[r.status] ?? STATUS_CONFIG['open']!
          const isInProgress = ['in_progress', 'IN_PROGRESS', 'ASSIGNED'].includes(r.status)
          const isUnassigned = r.assignedTo === 'Unassigned' || !r.assignedTo

          return (
            <div key={r.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Wrench className="h-5 w-5 text-gray-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{r.title}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', priority?.bg, priority?.color)}>
                      {priority?.label}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', status?.bg, status?.color)}>
                      {status?.label}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-500">
                    <span>Property: <span className="font-medium text-gray-700">{r.property?.title ?? r.property ?? r.propertyId ?? '—'}</span></span>
                    <span>Room: <span className="font-medium text-gray-700">{r.room ?? r.roomNumber ?? '—'}</span></span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium text-gray-700">{r.tenant?.name ?? r.tenant ?? r.reportedBy?.name ?? '—'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium text-gray-700">
                        {r.date ?? (r.createdAt ? format(new Date(r.createdAt), 'd MMM yyyy') : '—')}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      {r.category ?? (r.maintenanceCategory ? r.maintenanceCategory.charAt(0) + r.maintenanceCategory.slice(1).toLowerCase() : '—')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Assigned to: <span className="font-medium text-gray-700">{r.assignedTo ?? r.assignedProvider?.businessName ?? (r.assignedProviderId ? 'Provider #' + r.assignedProviderId.slice(-4) : 'Unassigned')}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-col gap-2">
                  <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  {isInProgress ? (
                    <button
                      onClick={() => markComplete(r.id)}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
                      Assign Vendor
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Verified Vendors */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Verified Vendors</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {VENDORS.map((v) => (
            <div key={v.category} className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 p-4 hover:border-brand-200 hover:bg-brand-50 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Wrench className="h-5 w-5 text-gray-500" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{v.category}</div>
                <div className="text-xs text-gray-400 mt-0.5">{v.count} verified vendors</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
