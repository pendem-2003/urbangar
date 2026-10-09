'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ChevronRight, ChevronLeft, Check, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { HYDERABAD_LOCALITIES } from '@urbangar/config'
import { cn } from '@/lib/utils'

const STEPS = ['Type', 'Location', 'Details', 'Pricing', 'Amenities', 'Photos', 'Review']

const AMENITY_OPTIONS = [
  'Parking', 'Lift', 'Power Backup', 'Security', 'CCTV', 'Gym', 'Swimming Pool',
  'Club House', 'Garden', 'Play Area', 'Intercom', 'Gas Pipeline', 'Wifi',
  'AC', 'Geyser', 'Washing Machine', 'Fridge', 'Microwave', 'Modular Kitchen',
  'Wardrobe', 'Balcony', 'Servant Room', 'Storeroom', 'Pooja Room',
]

type FormData = {
  type: string
  listingFor: string
  locality: string
  addressDisplay: string
  latitude: number
  longitude: number
  bhk: number
  bathrooms: number
  totalAreaSqft: number
  furnishing: string
  genderPreference: string
  petFriendly: boolean
  mealsIncluded: boolean
  availableBeds: number
  monthlyRent: number
  salePrice: number
  depositAmount: number
  maintenanceCharge: number
  amenities: string[]
  description: string
}

const INITIAL: FormData = {
  type: 'FLAT',
  listingFor: 'RENT',
  locality: '',
  addressDisplay: '',
  latitude: 17.385,
  longitude: 78.4867,
  bhk: 2,
  bathrooms: 2,
  totalAreaSqft: 1000,
  furnishing: 'SEMI_FURNISHED',
  genderPreference: 'ANY',
  petFriendly: false,
  mealsIncluded: false,
  availableBeds: 0,
  monthlyRent: 0,
  salePrice: 0,
  depositAmount: 0,
  maintenanceCharge: 0,
  amenities: [],
  description: '',
}

export default function ListPropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const update = (key: keyof FormData, value: unknown) => setForm((f) => ({ ...f, [key]: value }))

  const next = async () => {
    if (step === 5) {
      // After photos step, create + upload
      if (!propertyId) {
        setSubmitting(true)
        try {
          const typeLabel: Record<string, string> = { FLAT: 'Flat', PG: 'PG', HOSTEL: 'Hostel', VILLA: 'Villa', COMMERCIAL: 'Commercial' }
          const autoTitle = [form.bhk ? `${form.bhk}BHK` : '', typeLabel[form.type] ?? form.type, 'in', form.locality].filter(Boolean).join(' ')
          const { data } = await api.post('/properties', {
            ...form,
            title: autoTitle,
            addressFull: form.addressDisplay,
            bhk: form.bhk || undefined,
            monthlyRent: form.listingFor !== 'SALE' ? form.monthlyRent : undefined,
            salePrice: form.listingFor !== 'RENT' ? form.salePrice : undefined,
          })
          const id = data.data.id
          setPropertyId(id)

          if (photos.length) {
            const fd = new FormData()
            photos.forEach((f) => fd.append('files', f))
            await api.post(`/properties/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          }
        } catch (err: any) {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error'
          console.error('[list-property]', msg, err?.response?.data)
          toast.error(`Failed to save property: ${Array.isArray(msg) ? msg[0] : msg}`)
          setSubmitting(false)
          return
        }
        setSubmitting(false)
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    if (!propertyId) return
    setSubmitting(true)
    try {
      await api.patch(`/properties/${propertyId}/submit`)
      toast.success('Property submitted for review!')
      router.push('/owner/properties')
    } catch {
      toast.error('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">List your property</h1>
            <span className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full transition-colors',
                    i < step ? 'bg-brand-600' : i === step ? 'bg-brand-400' : 'bg-gray-200'
                  )}
                />
                <span className="hidden text-[10px] text-gray-400 sm:block">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {step === 0 && <StepType form={form} update={update} />}
        {step === 1 && <StepLocation form={form} update={update} />}
        {step === 2 && <StepDetails form={form} update={update} />}
        {step === 3 && <StepPricing form={form} update={update} />}
        {step === 4 && <StepAmenities form={form} update={update} />}
        {step === 5 && <StepPhotos photos={photos} setPhotos={setPhotos} />}
        {step === 6 && <StepReview form={form} photos={photos} />}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

function StepType({ form, update }: { form: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  const types = ['FLAT', 'PG', 'HOSTEL', 'VILLA', 'COMMERCIAL']
  const listing = ['RENT', 'SALE', 'BOTH']
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">What type of property?</h2>
        <p className="text-sm text-gray-400">Select the property type and listing purpose</p>
      </div>
      <FieldGroup label="Property type">
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => update('type', t)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                form.type === t ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-brand-300'
              )}
            >
              {t === 'PG' ? 'PG / Paying Guest' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Listing for">
        <div className="flex gap-2">
          {listing.map((l) => (
            <button
              key={l}
              onClick={() => update('listingFor', l)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                form.listingFor === l ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-brand-300'
              )}
            >
              {l === 'BOTH' ? 'Rent & Sale' : l.charAt(0) + l.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup label="Description (optional)">
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          placeholder="Describe your property — highlights, neighbourhood, amenities…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-400 focus:outline-none"
        />
      </FieldGroup>
    </div>
  )
}

function StepLocation({ form, update }: { form: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Where is the property?</h2>
        <p className="text-sm text-gray-400">Exact address is only shared after a confirmed visit</p>
      </div>
      <FieldGroup label="Locality *">
        <select
          value={form.locality}
          onChange={(e) => update('locality', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-400 focus:outline-none"
        >
          <option value="">Select locality</option>
          {HYDERABAD_LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </FieldGroup>
      <FieldGroup label="Display address (shown to seekers) *">
        <input
          type="text"
          value={form.addressDisplay}
          onChange={(e) => update('addressDisplay', e.target.value)}
          placeholder="e.g. Near Hitech City Metro, Kondapur"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-400 focus:outline-none"
        />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Latitude">
          <input
            type="number"
            step="0.0001"
            value={form.latitude}
            onChange={(e) => update('latitude', parseFloat(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </FieldGroup>
        <FieldGroup label="Longitude">
          <input
            type="number"
            step="0.0001"
            value={form.longitude}
            onChange={(e) => update('longitude', parseFloat(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </FieldGroup>
      </div>
      <p className="text-xs text-gray-400">
        Tip: Google the address and copy the coordinates from Google Maps for accuracy.
      </p>
    </div>
  )
}

function StepDetails({ form, update }: { form: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  const isPG = form.type === 'PG' || form.type === 'HOSTEL'
  const furnishing = ['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']
  const genderOptions = ['ANY', 'MALE', 'FEMALE']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Property details</h2>
        <p className="text-sm text-gray-400">Rooms, size, and preferences</p>
      </div>

      {!isPG && (
        <div className="grid grid-cols-3 gap-4">
          <FieldGroup label="BHK">
            <select
              value={form.bhk}
              onChange={(e) => update('bhk', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Bathrooms">
            <select
              value={form.bathrooms}
              onChange={(e) => update('bathrooms', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Area (sqft)">
            <input
              type="number"
              value={form.totalAreaSqft}
              onChange={(e) => update('totalAreaSqft', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            />
          </FieldGroup>
        </div>
      )}

      {isPG && (
        <FieldGroup label="Available beds">
          <input
            type="number"
            value={form.availableBeds}
            onChange={(e) => update('availableBeds', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </FieldGroup>
      )}

      <FieldGroup label="Furnishing status">
        <div className="flex gap-2">
          {furnishing.map((f) => (
            <button
              key={f}
              onClick={() => update('furnishing', f)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                form.furnishing === f ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-brand-300'
              )}
            >
              {f.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Gender preference">
        <div className="flex gap-2">
          {genderOptions.map((g) => (
            <button
              key={g}
              onClick={() => update('genderPreference', g)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                form.genderPreference === g ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-brand-300'
              )}
            >
              {g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </FieldGroup>

      <div className="flex gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={form.petFriendly}
            onChange={(e) => update('petFriendly', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600"
          />
          <span className="text-sm text-gray-700">Pet friendly</span>
        </label>
        {isPG && (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.mealsIncluded}
              onChange={(e) => update('mealsIncluded', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600"
            />
            <span className="text-sm text-gray-700">Meals included</span>
          </label>
        )}
      </div>
    </div>
  )
}

function StepPricing({ form, update }: { form: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Pricing</h2>
        <p className="text-sm text-gray-400">Set your rent or sale price</p>
      </div>

      {form.listingFor !== 'SALE' && (
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Monthly rent (₹) *">
            <input
              type="number"
              value={form.monthlyRent || ''}
              onChange={(e) => update('monthlyRent', Number(e.target.value))}
              placeholder="e.g. 25000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            />
          </FieldGroup>
          <FieldGroup label="Security deposit (₹)">
            <input
              type="number"
              value={form.depositAmount || ''}
              onChange={(e) => update('depositAmount', Number(e.target.value))}
              placeholder="e.g. 50000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
            />
          </FieldGroup>
        </div>
      )}

      {form.listingFor !== 'RENT' && (
        <FieldGroup label="Sale price (₹) *">
          <input
            type="number"
            value={form.salePrice || ''}
            onChange={(e) => update('salePrice', Number(e.target.value))}
            placeholder="e.g. 7500000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </FieldGroup>
      )}

      <FieldGroup label="Monthly maintenance charge (₹)">
        <input
          type="number"
          value={form.maintenanceCharge || ''}
          onChange={(e) => update('maintenanceCharge', Number(e.target.value))}
          placeholder="e.g. 2000"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        />
      </FieldGroup>
    </div>
  )
}

function StepAmenities({ form, update }: { form: FormData; update: (k: keyof FormData, v: unknown) => void }) {
  const toggleAmenity = (a: string) => {
    const current = form.amenities as string[]
    update('amenities', current.includes(a) ? current.filter((x) => x !== a) : [...current, a])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Amenities</h2>
        <p className="text-sm text-gray-400">Select all that apply — seekers filter by these</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {AMENITY_OPTIONS.map((a) => {
          const active = form.amenities.includes(a)
          return (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {active && <Check className="h-3 w-3" />}
              {a}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400">Selected: {form.amenities.length} amenities</p>
    </div>
  )
}

function StepPhotos({ photos, setPhotos }: { photos: File[]; setPhotos: (f: File[]) => void }) {
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setPhotos([...photos, ...newFiles].slice(0, 20))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Photos</h2>
        <p className="text-sm text-gray-400">Add up to 20 photos — listings with photos get 3× more inquiries</p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-10 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
        <Upload className="mb-2 h-8 w-8 text-gray-300" />
        <span className="text-sm font-medium text-gray-600">Click to upload photos</span>
        <span className="mt-1 text-xs text-gray-400">JPG, PNG, WebP • Max 20 photos</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((file, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-brand-600/80 px-2 py-0.5 text-center text-[10px] font-medium text-white">
                  Cover
                </div>
              )}
              <button
                onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 hidden rounded-full bg-black/50 p-0.5 text-white group-hover:flex"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StepReview({ form, photos }: { form: FormData; photos: File[] }) {
  const rows: [string, string][] = [
    ['Type', `${form.type} · ${form.listingFor}`],
    ['Locality', form.locality || '—'],
    ['Address shown', form.addressDisplay || '—'],
    ['BHK / Baths', `${form.bhk} BHK · ${form.bathrooms} bath`],
    ['Area', `${form.totalAreaSqft} sqft`],
    ['Furnishing', form.furnishing.replace('_', ' ')],
    ['Gender', form.genderPreference],
    ['Rent / mo', form.monthlyRent ? `₹${form.monthlyRent.toLocaleString('en-IN')}` : '—'],
    ['Sale price', form.salePrice ? `₹${form.salePrice.toLocaleString('en-IN')}` : '—'],
    ['Deposit', form.depositAmount ? `₹${form.depositAmount.toLocaleString('en-IN')}` : '—'],
    ['Amenities', form.amenities.length ? form.amenities.join(', ') : 'None'],
    ['Photos', `${photos.length} selected`],
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">Review & submit</h2>
        <p className="text-sm text-gray-400">Once submitted, our team will review and activate your listing</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {rows.map(([label, value], i) => (
          <div key={i} className={cn('flex gap-4 px-5 py-3', i % 2 === 0 ? 'bg-gray-50/50' : '')}>
            <span className="w-32 shrink-0 text-xs font-medium text-gray-500">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
        By submitting, you confirm that all details are accurate. Brokers and admins review listings before they go live.
      </div>
    </div>
  )
}
