'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Map, Plus, CheckCircle, Bed, Maximize2, Sofa, ShieldCheck, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const LOCALITIES = ['Gachibowli', 'Kondapur', 'Narsingi', 'Kokapet', 'Hi Tech City', 'Madhapur', 'Nallagandla', 'Nanakramguda', 'Manikonda', 'Financial District']
const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Builder House', 'Independent House', 'Penthouse']
const FURNISHING = ['Semi Furnished', 'Fully Furnished', 'Unfurnished']

const OCCUPANCY_COLOR = (pct: number) => pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'

export default function OwnerPropertiesPage() {
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([])
  const [selectedBHK, setSelectedBHK] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([])
  const [minArea, setMinArea] = useState('')
  const [maxArea, setMaxArea] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  const { data } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: async () => {
      const { data } = await api.get('/properties/mine')
      return data.data
    },
  })

  const properties: any[] = data?.items ?? data ?? []

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  // Enrich with mock occupancy data for demo
  const enriched = properties.map((p: any, i: number) => ({
    ...p,
    totalFlats: [320, 450, 240, 180, 600][i % 5],
    occupied: [285, 420, 220, 165, 550][i % 5],
    landmarks: [
      ['Botanical Garden', 'Chirec Public School', 'Sarath City Mall'],
      ['Mindspace', 'Inorbit Mall', 'Raheja IT Park'],
      ['Financial District', 'ISB', 'Continental Hospital'],
      ['DLF Cyber City', 'Infosys Campus'],
      ['Amazon HQ', 'IKEA Hyderabad'],
    ][i % 5],
    distanceFromHub: `${(0.5 + i * 0.4).toFixed(1)} km from Mindspace`,
  }))

  const filtered = enriched.filter((p: any) => {
    if (selectedTypes.length && !selectedTypes.includes(
      p.propertyType === 'APARTMENT' ? 'Apartment' : p.propertyType === 'VILLA' ? 'Villa' : p.propertyType ?? p.type ?? ''
    )) return false
    if (selectedBHK.length && !selectedBHK.includes(`${p.bhk ?? p.bedrooms} BHK`)) return false
    if (selectedFurnishing.length && !selectedFurnishing.some((f) =>
      p.furnishing?.toLowerCase().includes(f.split(' ')[0]!.toLowerCase()) ||
      p.furnishing === f.toUpperCase().replace(' ', '_')
    )) return false
    if (selectedLocalities.length && !selectedLocalities.includes(p.locality ?? '')) return false
    const area = p.areaSqft ?? p.sqft ?? 0
    if (minArea && area < parseInt(minArea)) return false
    if (maxArea && area > parseInt(maxArea)) return false
    const rent = p.rent ?? p.monthlyRent ?? 0
    if (minBudget && rent < parseInt(minBudget)) return false
    if (maxBudget && rent > parseInt(maxBudget)) return false
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gated Communities</h1>
          <p className="text-sm text-gray-500 mt-0.5">Managing {filtered.length || enriched.length || 8} premium communities in Hyderabad</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Map className="h-4 w-4" />
            View Map
          </button>
          <Link
            href="/owner/properties/new"
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Filters panel */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
            Filters
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="text-sm text-gray-400 hover:text-gray-700">
            {showFilters ? 'Hide' : 'Show'}
          </button>
        </div>

        {showFilters && (
          <div className="p-5 space-y-5">
            {/* Property Type */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                Property Type
              </div>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggle(selectedTypes, setSelectedTypes, t)}
                    className={cn('rounded-full border px-3 py-1.5 text-sm transition-colors', selectedTypes.includes(t) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* BHK */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M3 8V6a2 2 0 012-2h14a2 2 0 012 2v2" /></svg>
                BHK
              </div>
              <div className="flex flex-wrap gap-2">
                {BHK_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggle(selectedBHK, setSelectedBHK, b)}
                    className={cn('rounded-full border px-3 py-1.5 text-sm transition-colors', selectedBHK.includes(b) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                Area (Sq.Ft)
              </div>
              <div className="flex gap-3">
                <input value={minArea} onChange={(e) => setMinArea(e.target.value)} placeholder="Min" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                <input value={maxArea} onChange={(e) => setMaxArea(e.target.value)} placeholder="Max" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="10" width="20" height="8" rx="2" /><path d="M6 10V8a2 2 0 012-2h8a2 2 0 012 2v2" /></svg>
                Furnishing
              </div>
              <div className="flex flex-wrap gap-2">
                {FURNISHING.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggle(selectedFurnishing, setSelectedFurnishing, f)}
                    className={cn('rounded-full border px-3 py-1.5 text-sm transition-colors', selectedFurnishing.includes(f) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="11" r="3" /><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
                Location - Hyderabad
              </div>
              <div className="grid grid-cols-5 gap-2">
                {LOCALITIES.map((l) => (
                  <button
                    key={l}
                    onClick={() => toggle(selectedLocalities, setSelectedLocalities, l)}
                    className={cn('rounded-lg border px-3 py-2 text-xs text-center transition-colors', selectedLocalities.includes(l) ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <IndianRupee className="h-4 w-4 text-gray-400" />
                Budget (₹/month)
              </div>
              <div className="flex gap-3">
                <input value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="Min Budget" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                <input value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="Max Budget" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Cards Grid */}
      {enriched.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p: any) => {
            const occupancy = p.totalFlats ? Math.round((p.occupied / p.totalFlats) * 100) : 0
            return (
              <Link key={p.id} href={`/properties/${p.id}`} className="group block">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  {/* Photo */}
                  <div className="relative h-52 bg-gray-200">
                    {p.photos?.[0] ? (
                      <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <svg className="h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">Gated Community</span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                      <Map className="h-3 w-3" />
                      {p.distanceFromHub}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="11" r="3" /><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
                      {p.locality}, Hyderabad
                    </p>

                    {/* Specs */}
                    <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                      {p.bhk && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-brand-500" />
                          {p.bhk} BHK
                        </span>
                      )}
                      {p.areaSqft && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-brand-500" />
                          {p.areaSqft} sq.ft
                        </span>
                      )}
                      {p.furnishing && (
                        <span className="flex items-center gap-1">
                          <Sofa className="h-3.5 w-3.5 text-brand-500" />
                          {p.furnishing === 'FULLY_FURNISHED' ? 'Fully Furnished' : p.furnishing === 'SEMI_FURNISHED' ? 'Semi Furnished' : 'Unfurnished'}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-green-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </div>

                    {/* Occupancy */}
                    <div className="mt-4 flex items-center gap-4 text-xs">
                      <div>
                        <div className="text-gray-400 uppercase tracking-wide font-medium">Total Flats</div>
                        <div className="font-bold text-gray-900">{p.totalFlats?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 uppercase tracking-wide font-medium">Occupied</div>
                        <div className="font-bold text-gray-900">{p.occupied?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 uppercase tracking-wide font-medium">Occupancy</div>
                        <div className={cn('font-bold', occupancy >= 90 ? 'text-green-600' : occupancy >= 70 ? 'text-amber-600' : 'text-red-600')}>{occupancy}%</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className={cn('h-1.5 rounded-full', OCCUPANCY_COLOR(occupancy))}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>

                    {/* Landmarks */}
                    {p.landmarks?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.landmarks.map((l: string) => (
                          <span key={l} className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-500">{l}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        /* Empty state - show sample cards */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Aparna Serene Park', locality: 'Kondapur', totalFlats: 320, occupied: 285, bhk: 3, sqft: 1850, furnishing: 'Fully Furnished', landmarks: ['Botanical Garden', 'Chirec Public School', 'Sarath City Mall'] },
            { name: 'My Home Bhooja', locality: 'Hitech City', totalFlats: 450, occupied: 420, bhk: 4, sqft: 3400, furnishing: 'Semi Furnished', landmarks: ['Mindspace', 'Inorbit Mall', 'Raheja IT Park'] },
            { name: 'Prestige High Fields', locality: 'Gachibowli', totalFlats: 240, occupied: 220, bhk: 3, sqft: 2200, furnishing: 'Fully Furnished', landmarks: ['Financial District', 'ISB', 'Continental Hospital'] },
          ].map((p, i) => {
            const occ = Math.round((p.occupied / p.totalFlats) * 100)
            return (
              <div key={p.name} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative h-52">
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
                    ][i]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">Gated Community</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                    <Map className="h-3 w-3" />
                    {(0.5 + i * 0.5).toFixed(1)} km from Mindspace
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-white/70">{p.locality}, Hyderabad</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-brand-500" />{p.bhk} BHK</span>
                    <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5 text-brand-500" />{p.sqft} sq.ft</span>
                    <span className="flex items-center gap-1"><Sofa className="h-3.5 w-3.5 text-brand-500" />{p.furnishing}</span>
                    <span className="flex items-center gap-1 text-green-600"><ShieldCheck className="h-3.5 w-3.5" />Verified</span>
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-xs">
                    <div><div className="text-gray-400 uppercase font-medium">Total Flats</div><div className="font-bold text-gray-900">{p.totalFlats}</div></div>
                    <div><div className="text-gray-400 uppercase font-medium">Occupied</div><div className="font-bold text-gray-900">{p.occupied}</div></div>
                    <div><div className="text-gray-400 uppercase font-medium">Occupancy</div><div className={cn('font-bold', occ >= 90 ? 'text-green-600' : 'text-amber-600')}>{occ}%</div></div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                    <div className={cn('h-1.5 rounded-full', occ >= 90 ? 'bg-green-500' : 'bg-amber-500')} style={{ width: `${occ}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.landmarks.map((l) => <span key={l} className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-500">{l}</span>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
