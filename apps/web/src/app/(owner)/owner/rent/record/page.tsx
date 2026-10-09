'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ChevronLeft, CreditCard, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const METHODS = ['UPI', 'Net Banking', 'Card', 'Cash'] as const

export default function RecordRentPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ leaseId: '', amount: '', method: 'UPI' as typeof METHODS[number], month: '', notes: '' })

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await api.post('/leases/payments', {
        leaseId: form.leaseId,
        amount: parseInt(form.amount),
        paymentMethod: form.method.toUpperCase().replace(' ', '_'),
        forMonth: form.month,
        notes: form.notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-payments'] })
      setDone(true)
    },
  })

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Recorded</h2>
        <p className="text-sm text-gray-500 mb-6">The rent payment has been recorded successfully.</p>
        <div className="flex justify-center gap-3">
          <Link href="/owner/rent" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            Back to Rent
          </Link>
          <button onClick={() => { setDone(false); setForm({ leaseId: '', amount: '', method: 'UPI', month: '', notes: '' }) }} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Record Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/owner/rent" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Rent Collection
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Record Rent Payment</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manually record an offline or cash payment</p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <CreditCard className="h-4 w-4 text-brand-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Payment Details</h2>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Lease ID</label>
          <input value={form.leaseId} onChange={(e) => setForm({ ...form, leaseId: e.target.value })} placeholder="Lease ID" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 20000" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">For Month</label>
            <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Payment Method</label>
          <div className="grid grid-cols-4 gap-2">
            {METHODS.map((m) => (
              <button key={m} onClick={() => setForm({ ...form, method: m })} className={cn('rounded-xl border-2 py-2.5 text-sm font-medium transition-all', form.method === m ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700')}>{m}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Paid in cash at office" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
        </div>

        <button onClick={() => mutate()} disabled={isPending || !form.leaseId || !form.amount} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors">
          {isPending ? 'Recording…' : 'Record Payment'}
        </button>
      </div>
    </div>
  )
}
