'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Payment = {
  id: string
  amount: number
  status: string
  paidAt: string | null
  dueDate: string
  lease: { property: { title: string; locality: string } }
}

const STATUS: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Paid', color: 'text-green-700 bg-green-100' },
  PENDING: { label: 'Pending', color: 'text-amber-700 bg-amber-100' },
  OVERDUE: { label: 'Overdue', color: 'text-red-700 bg-red-100' },
  FAILED: { label: 'Failed', color: 'text-red-700 bg-red-50' },
}

export default function SeekerPaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['seeker-payments'],
    queryFn: async () => {
      const { data } = await api.get('/leases/payments/mine')
      return data.data as Payment[]
    },
  })

  const totalPaid = data?.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0) ?? 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Payment History</h1>
        <p className="text-sm text-gray-400">All your rent payments</p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Total paid</div>
        <div className="mt-1 text-2xl font-bold text-gray-900">₹{totalPaid.toLocaleString('en-IN')}</div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      )}

      {!isLoading && !data?.length && (
        <div className="flex flex-col items-center py-20 text-center">
          <CreditCard className="mb-3 h-12 w-12 text-gray-200" />
          <p className="font-medium text-gray-700">No payments yet</p>
          <p className="mt-1 text-sm text-gray-400">Your rent payments will appear here once a lease is created</p>
        </div>
      )}

      {data?.length ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {data.map((p, i) => {
            const s = STATUS[p.status] ?? STATUS['PENDING']!
            return (
              <div key={p.id} className={cn('flex items-center justify-between px-4 py-3', i !== data.length - 1 ? 'border-b border-gray-50' : '')}>
                <div>
                  <div className="text-sm font-medium text-gray-900">{p.lease.property.title}</div>
                  <div className="text-xs text-gray-400">
                    Due: {new Date(p.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {p.paidAt && ` · Paid: ${new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">₹{p.amount.toLocaleString('en-IN')}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', s.color)}>{s.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
