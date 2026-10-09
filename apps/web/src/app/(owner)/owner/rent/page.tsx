'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CheckCircle, Clock, TrendingUp, AlertCircle, Download, Bell, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const RECENT_PAYMENTS = [
  { name: 'Rahul Sharma', property: 'Cyber Heights PG', flat: 'A-101', method: 'UPI', date: '20 Nov 2024', amount: 14000 },
  { name: 'Priya Patel', property: 'Student Living Hostel', flat: 'B-205', method: 'Net Banking', date: '20 Nov 2024', amount: 9000 },
  { name: 'Sneha Reddy', property: 'Metro Connect Hostel', flat: 'D-102', method: 'UPI', date: '19 Nov 2024', amount: 6500 },
  { name: 'Vikram Singh', property: 'Techie Haven PG', flat: 'E-401', method: 'UPI', date: '19 Nov 2024', amount: 13000 },
]

const PENDING_PAYMENTS = [
  { name: 'Amit Kumar', property: 'Luxury Stay PG', flat: 'C-301', dueDate: '20 Nov 2024', reminded: 'Today', amount: 22000, overdueDays: 0 },
  { name: 'Anjali Mehta', property: 'Comfort Zone Hostel', flat: 'F-203', dueDate: '20 Nov 2024', reminded: 'Today', amount: 8000, overdueDays: 0 },
  { name: 'Rohan Desai', property: 'Cyber Heights PG', flat: 'A-205', dueDate: '15 Nov 2024', reminded: '2 days ago', amount: 14000, overdueDays: 5 },
]

const METHOD_DIST = [
  { label: 'UPI Payments', amount: 425000, pct: 56.5, barColor: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-600' },
  { label: 'Net Banking', amount: 252000, pct: 33.5, barColor: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
  { label: 'Card Payments', amount: 75000, pct: 10, barColor: 'bg-green-500', lightBg: 'bg-green-50', textColor: 'text-green-600' },
]

export default function OwnerRentPage() {
  const { data: payments } = useQuery({
    queryKey: ['owner-payments'],
    queryFn: async () => {
      const { data } = await api.get('/leases/payments/owner')
      return data.data
    },
  })

  const recentPayments = payments?.slice(0, 4) ?? RECENT_PAYMENTS

  const stats = [
    { label: 'Total Collected', value: `₹${(752000).toLocaleString('en-IN')}`, sub: 'This month', icon: CheckCircle, iconColor: 'text-green-600', ringBg: 'bg-green-50' },
    { label: 'Pending Collection', value: `₹${(93000).toLocaleString('en-IN')}`, sub: '12 tenants', icon: Clock, iconColor: 'text-amber-600', ringBg: 'bg-amber-50' },
    { label: 'Collection Rate', value: '89%', sub: '+5% vs last month', icon: TrendingUp, iconColor: 'text-blue-600', ringBg: 'bg-blue-50' },
    { label: 'Overdue Payments', value: '3', sub: '₹24,000', icon: AlertCircle, iconColor: 'text-red-600', ringBg: 'bg-red-50' },
  ]

  const methodLabel: Record<string, string> = { UPI: 'UPI', CARD: 'Card', NET_BANKING: 'Net Banking', CASH: 'Cash' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent Collection</h1>
          <p className="text-sm text-gray-500 mt-0.5">Automated digital rent collection and tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            <Bell className="h-4 w-4" />
            Send Reminders
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{s.label}</span>
                <div className={cn('rounded-xl p-2.5', s.ringBg)}>
                  <Icon className={cn('h-5 w-5', s.iconColor)} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Recent Payments</h2>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {recentPayments.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{p.name ?? p.tenant?.name}</p>
                  <p className="text-xs text-gray-400">{p.property ?? p.lease?.property?.title} • {p.flat ?? ''}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{p.method ?? (p.paymentMethod ? (methodLabel[p.paymentMethod] ?? p.paymentMethod) : 'Online')}</span>
                    <span className="text-xs text-gray-400">{p.date ?? (p.createdAt ? format(new Date(p.createdAt), 'd MMM yyyy') : '')}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-900">₹{(p.amount).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Pending Payments</h2>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-4">
            {PENDING_PAYMENTS.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.property} • {p.flat}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {p.overdueDays > 0 ? (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                        {p.overdueDays} days overdue
                      </span>
                    ) : (
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                        Due: {p.dueDate}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Reminded: {p.reminded}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</div>
                  <button className="mt-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Remind
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">Payment Methods Distribution</h2>
        <div className="grid grid-cols-3 gap-6">
          {METHOD_DIST.map((m) => (
            <div key={m.label} className="flex items-center gap-4">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', m.lightBg)}>
                <CreditCard className={cn('h-5 w-5', m.textColor)} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">{m.label}</div>
                <div className="text-lg font-bold text-gray-900">₹{m.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-green-600 font-medium">{m.pct}%</div>
              </div>
            </div>
          ))}
        </div>
        {/* Bar */}
        <div className="mt-5 flex h-2.5 w-full rounded-full overflow-hidden">
          {METHOD_DIST.map((m) => (
            <div key={m.label} className={m.barColor} style={{ width: `${m.pct}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
