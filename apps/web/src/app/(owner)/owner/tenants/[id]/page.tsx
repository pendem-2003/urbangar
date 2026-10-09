'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Phone, Mail, Home, CreditCard, CheckCircle, Clock, Shield, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function TenantProfilePage() {
  const { id } = useParams<{ id: string }>()

  const { data: lease, isLoading } = useQuery({
    queryKey: ['tenant-lease', id],
    queryFn: async () => {
      const { data } = await api.get(`/leases/${id}`)
      return data.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">Loading tenant profile…</div>
      </div>
    )
  }

  const tenant = lease?.tenant
  const name = tenant?.name ?? 'Tenant'
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/owner/tenants" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Back to Tenants
        </Link>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              {tenant?.kycStatus === 'VERIFIED' ? (
                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" /> KYC Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <Clock className="h-3 w-3" /> KYC Pending
                </span>
              )}
              {tenant?.isPoliceVerified && (
                <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Shield className="h-3 w-3" /> Police Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-brand-600">
              {tenant?.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {tenant.phone}
                </a>
              )}
              {tenant?.email && (
                <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {tenant.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lease details */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <Home className="h-4 w-4 text-brand-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Current Lease</h2>
        </div>
        {lease ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Property', lease.property?.title ?? '—'],
              ['Flat Number', lease.flatNumber ?? '—'],
              ['Monthly Rent', lease.monthlyRent ? `₹${parseInt(lease.monthlyRent).toLocaleString('en-IN')}` : '—'],
              ['Security Deposit', lease.securityDeposit ? `₹${parseInt(lease.securityDeposit).toLocaleString('en-IN')}` : '—'],
              ['Start Date', lease.startDate ? format(new Date(lease.startDate), 'd MMM yyyy') : '—'],
              ['Status', lease.status ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3">
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                <div className="font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No active lease found.</p>
        )}
      </div>

      {/* Rent history */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <CreditCard className="h-4 w-4 text-green-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Payment History</h2>
        </div>
        {lease?.payments?.length ? (
          <div className="space-y-3">
            {lease.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.forMonth ?? format(new Date(p.createdAt), 'MMM yyyy')}</div>
                    <div className="text-xs text-gray-400">{p.createdAt ? format(new Date(p.createdAt), 'd MMM yyyy') : ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{parseInt(p.amount).toLocaleString('en-IN')}</div>
                  <span className={cn('text-xs font-medium', p.status === 'PAID' ? 'text-green-600' : 'text-red-600')}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No payment records found.</p>
        )}
      </div>
    </div>
  )
}
