'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ChevronLeft, Building2, MapPin, Home, IndianRupee, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STEPS = ['details', 'location', 'pricing', 'review'] as const
type Step = typeof STEPS[number]

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK']
const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
const LOCALITIES = ['Gachibowli', 'Kondapur', 'Narsingi', 'Kokapet', 'Hi Tech City', 'Madhapur', 'Nallagandla', 'Nanakramguda', 'Manikonda', 'Financial District']

export default function NewPropertyPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    bhk: '',
    sqft: '',
    furnishing: '',
    totalFlats: '',
    locality: '',
    address: '',
    rent: '',
    deposit: '',
  })

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const next = () => { if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]!) }
  const back = () => { if (stepIndex > 0) setStep(STEPS[stepIndex - 1]!) }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post('/properties', {
        title: form.title,
        locality: form.locality,
        address: form.address,
        bhk: parseInt(form.bhk),
        sqft: parseInt(form.sqft),
        furnishing: form.furnishing.toUpperCase().replace(' ', '_'),
        totalFlats: parseInt(form.totalFlats),
        rent: parseInt(form.rent),
        deposit: parseInt(form.deposit),
        listingFor: 'RENT',
        propertyType: 'APARTMENT',
      })
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] })
      router.push('/owner/properties')
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/owner/properties" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" /> Back to Properties
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white mb-0">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            <Building2 className="h-3 w-3" /> Add Property
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-1">List Your Property</h1>
        <p className="text-white/70 text-sm">Add a new gated community property to your portfolio.</p>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-200 rounded-b-full mb-0 overflow-hidden">
        <div className="h-full bg-brand-600 rounded-b-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-0 p-8">
        {step === 'details' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50"><Building2 className="h-5 w-5 text-brand-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">Property Details</h2>
                <p className="text-xs text-gray-400">Basic information about the property</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Property Name / Society</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Aparna Serene Park" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Total Flats</label>
                  <input type="number" value={form.totalFlats} onChange={(e) => setForm({ ...form, totalFlats: e.target.value })} placeholder="e.g. 320" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Area (sq.ft)</label>
                  <input type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} placeholder="e.g. 1850" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">BHK Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {BHK_OPTIONS.map((b) => (
                    <button key={b} onClick={() => setForm({ ...form, bhk: b.replace(' BHK', '') })} className={cn('rounded-xl border-2 py-2.5 text-sm font-medium transition-all', form.bhk === b.replace(' BHK', '') ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700')}>{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Furnishing</label>
                <div className="grid grid-cols-3 gap-2">
                  {FURNISHING_OPTIONS.map((f) => (
                    <button key={f} onClick={() => setForm({ ...form, furnishing: f })} className={cn('rounded-xl border-2 py-2.5 text-xs font-medium transition-all', form.furnishing === f ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700')}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50"><MapPin className="h-5 w-5 text-brand-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">Location</h2>
                <p className="text-xs text-gray-400">Where is the property located?</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Locality</label>
                <div className="grid grid-cols-2 gap-2">
                  {LOCALITIES.map((l) => (
                    <button key={l} onClick={() => setForm({ ...form, locality: l })} className={cn('rounded-xl border-2 px-4 py-2.5 text-sm font-medium text-left transition-all', form.locality === l ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700')}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} placeholder="Street, landmark, city..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none" />
              </div>
            </div>
          </div>
        )}

        {step === 'pricing' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50"><IndianRupee className="h-5 w-5 text-brand-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">Pricing</h2>
                <p className="text-xs text-gray-400">Set rent and deposit amounts</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Monthly Rent (₹)</label>
                <input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="e.g. 25000" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Security Deposit (₹)</label>
                <input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="e.g. 50000" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">Review & Submit</h2>
                <p className="text-xs text-gray-400">Confirm your property details</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl bg-gray-50 p-5 text-sm">
              {[
                ['Property', form.title || '—'],
                ['BHK', form.bhk ? `${form.bhk} BHK` : '—'],
                ['Area', form.sqft ? `${form.sqft} sq.ft` : '—'],
                ['Furnishing', form.furnishing || '—'],
                ['Total Flats', form.totalFlats || '—'],
                ['Locality', form.locality || '—'],
                ['Monthly Rent', form.rent ? `₹${parseInt(form.rent).toLocaleString('en-IN')}` : '—'],
                ['Security Deposit', form.deposit ? `₹${parseInt(form.deposit).toLocaleString('en-IN')}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {stepIndex > 0 ? (
            <button onClick={back} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}
          {step === 'review' ? (
            <button onClick={handleSubmit} disabled={submitting} className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors">
              {submitting ? 'Submitting…' : 'List Property'}
            </button>
          ) : (
            <button onClick={next} className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
              Continue <Home className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
