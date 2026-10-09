'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ChevronLeft, UserPlus, Phone, Home, IndianRupee } from 'lucide-react'
import Link from 'next/link'

export default function NewTenantPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    propertyId: '',
    flatNumber: '',
    rent: '',
    moveInDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/leases', {
        tenantPhone: form.phone,
        propertyId: form.propertyId,
        flatNumber: form.flatNumber,
        monthlyRent: parseInt(form.rent),
        startDate: form.moveInDate,
      })
      router.push('/owner/tenants')
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/owner/tenants" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Tenants
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
        <p className="text-sm text-gray-500 mt-0.5">Onboard a tenant and create a lease</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
              <UserPlus className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Tenant Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  <Phone className="h-3 w-3 inline mr-1" />Mobile Number
                </label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
              <Home className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Property & Flat Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Property ID</label>
              <input required value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} placeholder="Property ID from properties list" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Flat / Room Number</label>
              <input required value={form.flatNumber} onChange={(e) => setForm({ ...form, flatNumber: e.target.value })} placeholder="e.g. A-101" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
              <IndianRupee className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Lease Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Monthly Rent (₹)</label>
              <input required type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="e.g. 20000" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Move-in Date</label>
              <input required type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors">
            {submitting ? 'Creating…' : 'Create Tenant & Lease'}
          </button>
        </div>
      </form>
    </div>
  )
}
