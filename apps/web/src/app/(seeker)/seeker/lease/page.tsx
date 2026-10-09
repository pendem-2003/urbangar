'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { FileText, Building2, Calendar, CreditCard, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Lease = {
  id: string
  status: string
  monthlyRent: number
  depositAmount: number
  startDate: string
  endDate: string
  property: { id: string; title: string; locality: string; photos: string[]; addressDisplay: string }
  rentPayments: { id: string; amount: number; status: string; dueDate: string; paidAt: string | null }[]
}

export default function SeekerLeasePage() {
  const { data: lease, isLoading } = useQuery({
    queryKey: ['seeker-lease'],
    queryFn: async () => {
      const { data } = await api.get('/leases/mine')
      return data.data as Lease | null
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-100" />)}
      </div>
    )
  }

  if (!lease) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <FileText className="mb-3 h-12 w-12 text-gray-200" />
        <p className="font-medium text-gray-700">No active lease</p>
        <p className="mt-1 text-sm text-gray-400">Once a broker or owner creates a lease for you, it will appear here</p>
        <Link href="/properties" className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Find a property
        </Link>
      </div>
    )
  }

  const next = lease.rentPayments.find((p) => p.status === 'PENDING' || p.status === 'OVERDUE')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Lease</h1>
        <p className="text-sm text-gray-400">Current rental agreement</p>
      </div>

      {/* Property card */}
      <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="flex gap-4 p-4">
          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {lease.property.photos[0] ? (
              <img src={lease.property.photos[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center"><Building2 className="h-6 w-6 text-gray-300" /></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{lease.property.title}</h2>
            <p className="text-sm text-gray-400">{lease.property.locality}</p>
            <p className="mt-1 text-xs text-gray-500">{lease.property.addressDisplay}</p>
            <span className={cn(
              'mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              lease.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {lease.status}
            </span>
          </div>
        </div>
      </div>

      {/* Lease details */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Monthly rent', value: `₹${lease.monthlyRent.toLocaleString('en-IN')}`, icon: <CreditCard className="h-4 w-4" /> },
          { label: 'Lease period', value: `${new Date(lease.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – ${new Date(lease.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`, icon: <Calendar className="h-4 w-4" /> },
          { label: 'Security deposit', value: `₹${lease.depositAmount.toLocaleString('en-IN')}`, icon: <FileText className="h-4 w-4" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</div>
            <div>
              <div className="text-xs text-gray-400">{label}</div>
              <div className="text-sm font-semibold text-gray-900">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Next payment */}
      {next && (
        <div className={cn(
          'mb-4 flex items-center justify-between rounded-xl border p-4',
          next.status === 'OVERDUE' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
        )}>
          <div className="flex items-center gap-2">
            <Clock className={cn('h-5 w-5', next.status === 'OVERDUE' ? 'text-red-500' : 'text-amber-500')} />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {next.status === 'OVERDUE' ? 'Overdue payment' : 'Next rent due'}
              </div>
              <div className="text-xs text-gray-500">
                Due {new Date(next.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900">₹{next.amount.toLocaleString('en-IN')}</div>
        </div>
      )}

      {/* Recent payments */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-50 px-4 py-3 font-semibold text-gray-900 text-sm">Recent payments</div>
        {lease.rentPayments.slice(0, 5).map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0">
            <div>
              <div className="text-sm text-gray-900">Rent payment</div>
              <div className="text-xs text-gray-400">
                Due: {new Date(p.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {p.paidAt && ` · Paid: ${new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</div>
              <span className={cn(
                'text-xs font-medium',
                p.status === 'PAID' ? 'text-green-600' : p.status === 'OVERDUE' ? 'text-red-600' : 'text-amber-600'
              )}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
