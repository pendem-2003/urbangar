'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ChevronLeft, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'AC / HVAC', 'Painting', 'Other'] as const
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'border-gray-200 text-gray-600',
  NORMAL: 'border-gray-200 text-gray-600',
  HIGH: 'border-amber-300 text-amber-700 bg-amber-50',
  URGENT: 'border-red-300 text-red-700 bg-red-50',
}

export default function NewMaintenancePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'NORMAL' as typeof PRIORITIES[number],
    propertyId: '',
    flatNumber: '',
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await api.post('/maintenance', {
        title: form.title,
        description: form.description,
        maintenanceCategory: form.category.toUpperCase(),
        priority: form.priority,
        propertyId: form.propertyId,
        flatNumber: form.flatNumber,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-maintenance'] })
      setDone(true)
    },
  })

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Request Created</h2>
        <p className="text-sm text-gray-500 mb-6">The maintenance request has been submitted.</p>
        <div className="flex justify-center gap-3">
          <Link href="/owner/maintenance" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            View All Requests
          </Link>
          <button onClick={() => { setDone(false); setForm({ title: '', description: '', category: '', priority: 'NORMAL', propertyId: '', flatNumber: '' }) }} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/owner/maintenance" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Maintenance
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Maintenance Request</h1>
        <p className="text-sm text-gray-500 mt-0.5">Report an issue or request a repair</p>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
              <Wrench className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Issue Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Issue Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Water leakage in bathroom" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the issue in detail…" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, category: c })} className={cn('rounded-xl border-2 py-2.5 text-sm font-medium transition-all', form.category === c ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700')}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Priority & Location</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button key={p} onClick={() => setForm({ ...form, priority: p })} className={cn('rounded-xl border-2 py-2.5 text-sm font-medium capitalize transition-all', form.priority === p ? 'border-brand-600 bg-brand-50 text-brand-700' : PRIORITY_STYLES[p])}>{p.toLowerCase()}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Property ID</label>
                <input value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} placeholder="Property ID" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Flat / Room</label>
                <input value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} placeholder="e.g. A-101" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => mutate()} disabled={isPending || !form.title || !form.category} className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition-colors">
            {isPending ? 'Creating…' : 'Create Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
