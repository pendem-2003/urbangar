'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { UserPlus, Search, CheckCircle, Clock, Shield, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

type Filter = 'all' | 'verified' | 'pending'

const SAMPLE_TENANTS = [
  { id: '1', name: 'Rahul Sharma', property: 'Cyber Heights PG', flat: 'A-101', org: 'IIIT Hyderabad', joinDate: '2024-11-15', phone: '+91 98765 43210', email: 'rahul.sharma@email.com', rent: 14000, kyc: 'VERIFIED', police: true, paid: true },
  { id: '2', name: 'Priya Patel', property: 'Student Living Hostel', flat: 'B-205', org: 'University of Hyderabad', joinDate: '2024-11-20', phone: '+91 98765 43211', email: 'priya.patel@email.com', rent: 9000, kyc: 'VERIFIED', police: true, paid: true },
  { id: '3', name: 'Amit Kumar', property: 'Luxury Stay PG', flat: 'C-301', org: 'ISB Hyderabad', joinDate: '2024-11-18', phone: '+91 98765 43212', email: 'amit.kumar@email.com', rent: 22000, kyc: 'PENDING', police: false, paid: false },
  { id: '4', name: 'Sneha Reddy', property: 'Metro Connect Hostel', flat: 'D-102', org: 'Manipal University', joinDate: '2024-11-10', phone: '+91 98765 43213', email: 'sneha.reddy@email.com', rent: 8500, kyc: 'VERIFIED', police: true, paid: true },
  { id: '5', name: 'Vikram Singh', property: 'Techie Haven PG', flat: 'E-401', org: 'TCS Hyderabad', joinDate: '2024-11-08', phone: '+91 98765 43214', email: 'vikram.singh@email.com', rent: 13000, kyc: 'VERIFIED', police: true, paid: false },
  { id: '6', name: 'Divya Nair', property: 'Comfort Zone Hostel', flat: 'F-203', org: 'Infosys Campus', joinDate: '2024-11-22', phone: '+91 98765 43215', email: 'divya.nair@email.com', rent: 11000, kyc: 'PENDING', police: false, paid: false },
]

export default function OwnerTenantsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['owner-leases'],
    queryFn: async () => {
      const { data } = await api.get('/leases/owner')
      return data.data
    },
  })

  const tenants = data?.length ? data.map((l: any) => ({
    id: l.id,
    name: l.tenant?.name ?? 'Unknown',
    property: l.property?.title ?? '',
    flat: l.property?.locality ?? '',
    joinDate: l.startDate,
    phone: l.tenant?.phone ?? '',
    email: '',
    rent: l.monthlyRent,
    kyc: 'VERIFIED',
    police: true,
    paid: true,
    org: '',
  })) : SAMPLE_TENANTS

  const filtered = tenants.filter((t: any) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.flat.toLowerCase().includes(search.toLowerCase()) || t.property.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'verified' && t.kyc === 'VERIFIED') || (filter === 'pending' && t.kyc === 'PENDING')
    return matchSearch && matchFilter
  })

  const counts = {
    all: tenants.length,
    verified: tenants.filter((t: any) => t.kyc === 'VERIFIED').length,
    pending: tenants.filter((t: any) => t.kyc === 'PENDING').length,
  }

  const initials = (name: string) => name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const COLORS = ['bg-purple-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500', 'bg-teal-500']

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Verified tenant screening and onboarding for gated communities</p>
        </div>
        <Link
          href="/owner/tenants/new"
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add New Tenant
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenants by name, flat/room, or property..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'verified', 'pending'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                filter === f ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              {f === 'verified' && <CheckCircle className="h-3.5 w-3.5" />}
              {f === 'pending' && <Clock className="h-3.5 w-3.5" />}
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' && `(${counts.all})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tenant list */}
      <div className="space-y-3">
        {filtered.map((t: any, idx: number) => (
          <div key={t.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white', COLORS[idx % COLORS.length])}>
                {initials(t.name)}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{t.name}</span>
                  {t.kyc === 'VERIFIED' ? (
                    <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> KYC Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      <Clock className="h-3 w-3" /> Pending
                    </span>
                  )}
                  {t.police && (
                    <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <Shield className="h-3 w-3" /> Police Verified
                    </span>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-500">
                  <span>Property: <span className="font-medium text-gray-700">{t.property}</span></span>
                  <span>Flat: <span className="font-medium text-gray-700">{t.flat}</span></span>
                  {t.org && <span>Organization: <span className="font-medium text-gray-700">{t.org}</span></span>}
                  {t.joinDate && <span>Join Date: <span className="font-medium text-gray-700">{format(new Date(t.joinDate), 'd MMM yyyy')}</span></span>}
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-brand-600">
                  <a href={`tel:${t.phone}`} className="flex items-center gap-1 hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {t.phone}
                  </a>
                  {t.email && (
                    <a href={`mailto:${t.email}`} className="flex items-center gap-1 hover:underline">
                      <Mail className="h-3.5 w-3.5" /> {t.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Right: rent + actions */}
              <div className="shrink-0 text-right">
                <div className="text-xs text-gray-400">Monthly Rent</div>
                <div className="text-lg font-bold text-gray-900">₹{t.rent.toLocaleString('en-IN')}</div>
                <div className={cn('mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', t.paid ? 'bg-gray-900 text-white' : 'bg-red-100 text-red-700')}>
                  {t.paid ? 'Paid' : 'Pending'}
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  <Link href={`/owner/tenants/${t.id}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 text-center transition-colors">
                    View Profile
                  </Link>
                  {t.kyc === 'PENDING' && (
                    <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors">
                      Complete KYC
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 py-16 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-4">
              <UserPlus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No tenants found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
