'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { HYDERABAD_LOCALITIES } from '@urbangar/config'
import { cn } from '@/lib/utils'
import { AlertTriangle, Check, Upload, X, Building2 } from 'lucide-react'

const AMENITY_OPTIONS = [
  'Parking', 'Lift', 'Power Backup', 'Security', 'CCTV', 'Gym', 'Swimming Pool',
  'Club House', 'Garden', 'Play Area', 'Intercom', 'Gas Pipeline', 'Wifi',
  'AC', 'Geyser', 'Washing Machine', 'Fridge', 'Microwave', 'Modular Kitchen',
  'Wardrobe', 'Balcony', 'Servant Room', 'Storeroom', 'Pooja Room',
]

type Property = {
  id: string
  status: string
  type: string
  listingFor: string
  description: string
  locality: string
  addressDisplay: string
  latitude: number
  longitude: number
  bhk: number | null
  bathrooms: number | null
  totalAreaSqft: number | null
  furnishing: string
  genderPreference: string
  petFriendly: boolean
  mealsIncluded: boolean
  availableBeds: number | null
  monthlyRent: number | null
  salePrice: number | null
  depositAmount: number | null
  maintenanceCharge: number | null
  amenities: string[]
  photos: string[]
  hasPendingEdit: boolean
}

interface Props {
  property: Property
  backHref: string
}

export function EditPropertyForm({ property: p, backHref }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [newPhotos, setNewPhotos] = useState<File[]>([])

  const [form, setForm] = useState({
    type: p.type,
    listingFor: p.listingFor,
    description: p.description ?? '',
    locality: p.locality,
    addressDisplay: p.addressDisplay,
    latitude: p.latitude,
    longitude: p.longitude,
    bhk: p.bhk ?? 2,
    bathrooms: p.bathrooms ?? 1,
    totalAreaSqft: p.totalAreaSqft ?? 0,
    furnishing: p.furnishing ?? 'UNFURNISHED',
    genderPreference: p.genderPreference ?? 'ANY',
    petFriendly: p.petFriendly ?? false,
    mealsIncluded: p.mealsIncluded ?? false,
    availableBeds: p.availableBeds ?? 0,
    monthlyRent: p.monthlyRent ?? 0,
    salePrice: p.salePrice ?? 0,
    depositAmount: p.depositAmount ?? 0,
    maintenanceCharge: p.maintenanceCharge ?? 0,
    amenities: p.amenities ?? [],
  })

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const toggleAmenity = (a: string) =>
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a])

  const isActive = p.status === 'ACTIVE'
  const isPG = form.type === 'PG' || form.type === 'HOSTEL'

  const handleSave = async () => {
    setSaving(true)
    try {
      // Upload any new photos first
      if (newPhotos.length) {
        const fd = new globalThis.FormData()
        newPhotos.forEach((f) => fd.append('files', f))
        await api.post(`/properties/${p.id}/photos`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      await api.patch(`/properties/${p.id}`, {
        ...form,
        bhk: form.bhk || undefined,
        monthlyRent: form.listingFor !== 'SALE' ? form.monthlyRent : undefined,
        salePrice: form.listingFor !== 'RENT' ? form.salePrice : undefined,
      })

      toast.success(
        isActive
          ? 'Edit saved — waiting for admin approval before going live'
          : 'Property updated'
      )
      router.push(backHref)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit property</h1>
          <p className="text-sm text-gray-400">{p.locality}</p>
        </div>
        <button
          onClick={() => router.push(backHref)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {isActive && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            This listing is currently <strong>live</strong>. Your changes will be queued for admin review.
            The listing stays visible with the current details until approved.
          </p>
        </div>
      )}

      {p.hasPendingEdit && (
        <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-sm text-blue-800">
            You have a pending edit waiting for admin approval. Saving again will replace the pending edit.
          </p>
        </div>
      )}

      {/* Type & Listing */}
      <Section title="Property type">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Property type">
            <ToggleGroup
              options={['FLAT', 'PG', 'HOSTEL', 'VILLA', 'COMMERCIAL']}
              value={form.type}
              onChange={(v) => set('type', v)}
              label={(v) => v === 'PG' ? 'PG' : v.charAt(0) + v.slice(1).toLowerCase()}
            />
          </Field>
          <Field label="Listing for">
            <ToggleGroup
              options={['RENT', 'SALE', 'BOTH']}
              value={form.listingFor}
              onChange={(v) => set('listingFor', v)}
              label={(v) => v === 'BOTH' ? 'Rent & Sale' : v.charAt(0) + v.slice(1).toLowerCase()}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className="input w-full"
            placeholder="Describe the property…"
          />
        </Field>
      </Section>

      {/* Location */}
      <Section title="Location">
        <Field label="Locality">
          <select
            value={form.locality}
            onChange={(e) => set('locality', e.target.value)}
            className="input w-full"
          >
            <option value="">Select locality</option>
            {HYDERABAD_LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Display address">
          <input
            type="text"
            value={form.addressDisplay}
            onChange={(e) => set('addressDisplay', e.target.value)}
            className="input w-full"
            placeholder="e.g. Near Metro, Kondapur"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <input type="number" step="0.0001" value={form.latitude}
              onChange={(e) => set('latitude', parseFloat(e.target.value))}
              className="input w-full" />
          </Field>
          <Field label="Longitude">
            <input type="number" step="0.0001" value={form.longitude}
              onChange={(e) => set('longitude', parseFloat(e.target.value))}
              className="input w-full" />
          </Field>
        </div>
      </Section>

      {/* Details */}
      <Section title="Property details">
        {!isPG && (
          <div className="grid grid-cols-3 gap-4">
            <Field label="BHK">
              <select value={form.bhk} onChange={(e) => set('bhk', Number(e.target.value))} className="input w-full">
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} BHK</option>)}
              </select>
            </Field>
            <Field label="Bathrooms">
              <select value={form.bathrooms} onChange={(e) => set('bathrooms', Number(e.target.value))} className="input w-full">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Area (sqft)">
              <input type="number" value={form.totalAreaSqft}
                onChange={(e) => set('totalAreaSqft', Number(e.target.value))}
                className="input w-full" />
            </Field>
          </div>
        )}
        {isPG && (
          <Field label="Available beds">
            <input type="number" value={form.availableBeds}
              onChange={(e) => set('availableBeds', Number(e.target.value))}
              className="input w-full" />
          </Field>
        )}
        <Field label="Furnishing">
          <ToggleGroup
            options={['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']}
            value={form.furnishing}
            onChange={(v) => set('furnishing', v)}
            label={(v) => v.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          />
        </Field>
        <Field label="Gender preference">
          <ToggleGroup
            options={['ANY', 'MALE', 'FEMALE']}
            value={form.genderPreference}
            onChange={(v) => set('genderPreference', v)}
            label={(v) => v.charAt(0) + v.slice(1).toLowerCase()}
          />
        </Field>
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={form.petFriendly}
              onChange={(e) => set('petFriendly', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600" />
            <span className="text-sm text-gray-700">Pet friendly</span>
          </label>
          {isPG && (
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.mealsIncluded}
                onChange={(e) => set('mealsIncluded', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600" />
              <span className="text-sm text-gray-700">Meals included</span>
            </label>
          )}
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        {form.listingFor !== 'SALE' && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly rent (₹)">
              <input type="number" value={form.monthlyRent || ''}
                onChange={(e) => set('monthlyRent', Number(e.target.value))}
                className="input w-full" placeholder="e.g. 25000" />
            </Field>
            <Field label="Security deposit (₹)">
              <input type="number" value={form.depositAmount || ''}
                onChange={(e) => set('depositAmount', Number(e.target.value))}
                className="input w-full" placeholder="e.g. 50000" />
            </Field>
          </div>
        )}
        {form.listingFor !== 'RENT' && (
          <Field label="Sale price (₹)">
            <input type="number" value={form.salePrice || ''}
              onChange={(e) => set('salePrice', Number(e.target.value))}
              className="input w-full" placeholder="e.g. 7500000" />
          </Field>
        )}
        <Field label="Maintenance charge (₹/mo)">
          <input type="number" value={form.maintenanceCharge || ''}
            onChange={(e) => set('maintenanceCharge', Number(e.target.value))}
            className="input w-full" placeholder="e.g. 2000" />
        </Field>
      </Section>

      {/* Amenities */}
      <Section title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const active = form.amenities.includes(a)
            return (
              <button key={a} onClick={() => toggleAmenity(a)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}>
                {active && <Check className="h-3 w-3" />}
                {a}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Photos */}
      <Section title="Photos">
        {p.photos.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs text-gray-400">Current photos</p>
            <div className="grid grid-cols-4 gap-3">
              {p.photos.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-brand-600/80 px-1 py-0.5 text-center text-[9px] font-medium text-white">
                      Cover
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-8 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors">
          <Upload className="mb-2 h-6 w-6 text-gray-300" />
          <span className="text-sm font-medium text-gray-600">Add more photos</span>
          <span className="mt-1 text-xs text-gray-400">These will be added to current photos</span>
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
              setNewPhotos((prev) => [...prev, ...files].slice(0, 20))
            }} />
        </label>

        {newPhotos.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {newPhotos.map((file, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setNewPhotos(newPhotos.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 hidden rounded-full bg-black/50 p-0.5 text-white group-hover:flex"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Save */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
        <button
          onClick={() => router.push(backHref)}
          className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isActive ? 'Submit edit for review' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}

function ToggleGroup({
  options, value, onChange, label,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  label: (v: string) => string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            value === o
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-gray-200 text-gray-700 hover:border-brand-300'
          )}
        >
          {label(o)}
        </button>
      ))}
    </div>
  )
}
