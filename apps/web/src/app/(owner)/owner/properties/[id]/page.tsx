'use client'

import { use, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Building2, Users, FileText, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function OwnerPropertyManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: property, isLoading: propLoading } = useQuery({
    queryKey: ['property-owner', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}/owner`)
      return data.data
    },
  })

  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['property-contacts', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}/contacts`)
      return data.data as Contact[]
    },
    enabled: !!property,
  })

  const { data: activeLease, refetch: refetchLease } = useQuery({
    queryKey: ['property-lease', id],
    queryFn: async () => {
      const { data } = await api.get(`/leases/property/${id}`)
      return data.data as ActiveLease | null
    },
    enabled: !!property,
  })

  if (propLoading) {
    return (
      <DashboardShell role="OWNER" backHref="/owner/properties">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="OWNER" backHref="/owner/properties" title={property?.title ?? 'Property'}>
      <div className="space-y-6">
        {/* Property header */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {property?.photos?.[0] ? (
              <img src={property.photos[0]} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center"><Building2 className="h-6 w-6 text-gray-300" /></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-base font-bold text-gray-900">{property?.title}</h1>
            <p className="text-sm text-gray-400">{property?.locality}</p>
            <StatusBadge status={property?.status} />
          </div>
          <Link
            href={`/owner/properties/${id}/edit`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Edit
          </Link>
        </div>

        {/* Active lease */}
        {activeLease && (
          <ActiveLeaseCard lease={activeLease} propertyId={id} onTerminated={() => refetchLease()} />
        )}

        {/* Interested seekers */}
        {property?.status === 'ACTIVE' && !activeLease && (
          <InterestedSeekers
            contacts={contacts ?? []}
            loading={contactsLoading}
            propertyId={id}
            monthlyRent={property?.monthlyRent}
            depositAmount={property?.depositAmount}
            onLeaseCreated={() => refetchLease()}
          />
        )}

        {property?.status === 'RENTED' && !activeLease && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            This property is marked as RENTED but no active lease record was found. Contact support if this is incorrect.
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

type Contact = {
  id: string
  userId: string
  createdAt: string
  user: { id: string; name: string | null; phone: string; avatarUrl: string | null }
}

type ActiveLease = {
  id: string
  tenantId: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
  depositStatus: string
  status: string
  tenant: { id: string; name: string | null; phone: string; avatarUrl: string | null }
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'text-green-700 bg-green-100',
    RENTED: 'text-blue-700 bg-blue-100',
    PENDING_REVIEW: 'text-amber-700 bg-amber-100',
    DRAFT: 'text-gray-500 bg-gray-100',
    REJECTED: 'text-red-700 bg-red-100',
    INACTIVE: 'text-gray-500 bg-gray-100',
  }
  if (!status) return null
  return (
    <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium', map[status] ?? 'bg-gray-100 text-gray-500')}>
      {status.replace('_', ' ')}
    </span>
  )
}

function ActiveLeaseCard({ lease, propertyId, onTerminated }: { lease: ActiveLease; propertyId: string; onTerminated: () => void }) {
  const queryClient = useQueryClient()
  const [showTerminate, setShowTerminate] = useState(false)
  const [form, setForm] = useState<{ reason: string; depositStatus: 'RELEASED' | 'PARTIALLY_RELEASED' | 'FORFEITED'; depositReturnedAmount: string }>({ reason: '', depositStatus: 'RELEASED', depositReturnedAmount: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleTerminate = async () => {
    if (!form.reason) return
    setSubmitting(true)
    try {
      await api.patch(`/leases/${lease.id}/terminate`, {
        reason: form.reason,
        depositStatus: form.depositStatus,
        depositReturnedAmount: form.depositReturnedAmount ? Number(form.depositReturnedAmount) : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
      queryClient.invalidateQueries({ queryKey: ['property-owner', propertyId] })
      onTerminated()
      setShowTerminate(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-blue-900">Active Lease</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-700">
          {lease.tenant.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{lease.tenant.name ?? 'Tenant'}</p>
          <p className="text-xs text-gray-500">{lease.tenant.phone}</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>₹{lease.monthlyRent.toLocaleString('en-IN')}/mo</p>
          <p>{new Date(lease.startDate).toLocaleDateString('en-IN')} – {new Date(lease.endDate).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      {!showTerminate ? (
        <button
          onClick={() => setShowTerminate(true)}
          className="mt-4 w-full rounded-lg border border-red-200 bg-white py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          End tenancy
        </button>
      ) : (
        <div className="mt-4 space-y-3 rounded-lg bg-white p-4">
          <p className="text-sm font-medium text-gray-800">End tenancy details</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Reason for ending</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="e.g. Tenant vacated on mutual agreement"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Deposit outcome</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              value={form.depositStatus}
              onChange={(e) => setForm((f) => ({ ...f, depositStatus: e.target.value as any }))}
            >
              <option value="RELEASED">Fully released (full refund)</option>
              <option value="PARTIALLY_RELEASED">Partially released</option>
              <option value="FORFEITED">Forfeited (no refund)</option>
            </select>
          </div>
          {form.depositStatus === 'PARTIALLY_RELEASED' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Amount returned (₹)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="0"
                value={form.depositReturnedAmount}
                onChange={(e) => setForm((f) => ({ ...f, depositReturnedAmount: e.target.value }))}
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setShowTerminate(false)}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleTerminate}
              disabled={submitting || !form.reason}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Ending…' : 'Confirm end tenancy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InterestedSeekers({
  contacts, loading, propertyId, monthlyRent, depositAmount, onLeaseCreated,
}: {
  contacts: Contact[]
  loading: boolean
  propertyId: string
  monthlyRent?: number | null
  depositAmount?: number | null
  onLeaseCreated: () => void
}) {
  const [offerModal, setOfferModal] = useState<Contact | null>(null)

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-900">Interested seekers</h2>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          {contacts.length}
        </span>
      </div>

      {loading && <div className="h-20 animate-pulse rounded-lg bg-gray-100" />}

      {!loading && contacts.length === 0 && (
        <p className="text-sm text-gray-400">No one has expressed interest yet.</p>
      )}

      {contacts.map((c) => (
        <div key={c.id} className="flex items-center gap-3 border-t border-gray-50 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {c.user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{c.user.name ?? 'Unknown'}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Phone className="h-3 w-3" />{c.user.phone}
            </p>
          </div>
          <button
            onClick={() => setOfferModal(c)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Offer lease
          </button>
        </div>
      ))}

      {offerModal && (
        <LeaseOfferModal
          contact={offerModal}
          propertyId={propertyId}
          defaultRent={monthlyRent ?? undefined}
          defaultDeposit={depositAmount ?? undefined}
          onClose={() => setOfferModal(null)}
          onCreated={() => { setOfferModal(null); onLeaseCreated() }}
        />
      )}
    </div>
  )
}

function LeaseOfferModal({
  contact, propertyId, defaultRent, defaultDeposit, onClose, onCreated,
}: {
  contact: Contact
  propertyId: string
  defaultRent?: number
  defaultDeposit?: number
  onClose: () => void
  onCreated: () => void
}) {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]!
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!

  const [form, setForm] = useState({
    startDate: today,
    endDate: nextYear,
    monthlyRent: String(defaultRent ?? ''),
    depositAmount: String(defaultDeposit ?? ''),
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.monthlyRent || !form.depositAmount) {
      setError('All fields are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/leases', {
        propertyId,
        tenantId: contact.user.id,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyRent: Number(form.monthlyRent),
        depositAmount: Number(form.depositAmount),
      })
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
      queryClient.invalidateQueries({ queryKey: ['property-owner', propertyId] })
      onCreated()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create lease')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-gray-900">Offer lease to {contact.user.name}</h3>
        <p className="mt-0.5 text-xs text-gray-400">{contact.user.phone}</p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Start date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">End date</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Monthly rent (₹)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="0"
                value={form.monthlyRent}
                onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Deposit (₹)</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="0"
                value={form.depositAmount}
                onChange={(e) => setForm((f) => ({ ...f, depositAmount: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create lease'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
