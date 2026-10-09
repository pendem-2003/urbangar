'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Home, Bed, Maximize2, Sofa, ShieldCheck, IndianRupee, ChevronRight, ChevronLeft, Sparkles, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['office', 'location', 'budget', 'bhk'] as const
type Step = typeof STEPS[number]

const OFFICE_LOCATIONS = [
  'Mindspace / Hitech City',
  'Financial District / Gachibowli',
  'Cyber Towers',
  'DLF Cyber City',
  'Infosys Campus',
  'Other',
]

const LOCALITIES = [
  'Gachibowli', 'Kondapur', 'Narsingi', 'Kokapet', 'Hi Tech City',
  'Madhapur', 'Nallagandla', 'Nanakramguda', 'Manikonda', 'Financial District',
]

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK']

const SAMPLE_RESULTS = [
  { name: 'Aparna Serene Park', locality: 'Kondapur', bhk: 3, sqft: 1850, furnishing: 'Fully Furnished', distance: '1.5 km from Mindspace', totalFlats: 320, occupied: 285, landmarks: ['Botanical Garden', 'Chirec Public School', 'Sarath City Mall'], img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80' },
  { name: 'My Home Bhooja', locality: 'Hitech City', bhk: 4, sqft: 3400, furnishing: 'Semi Furnished', distance: '0.5 km from Mindspace', totalFlats: 450, occupied: 420, landmarks: ['Mindspace', 'Inorbit Mall', 'Raheja IT Park'], img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80' },
  { name: 'Prestige High Fields', locality: 'Gachibowli', bhk: 3, sqft: 2200, furnishing: 'Fully Furnished', distance: '1 km from Mindspace', totalFlats: 240, occupied: 220, landmarks: ['Financial District', 'ISB', 'Continental Hospital'], img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80' },
]

export default function FindAHomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('office')
  const [showResults, setShowResults] = useState(false)

  const [office, setOffice] = useState('')
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([])
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [selectedBHK, setSelectedBHK] = useState<string[]>([])

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const toggleLocality = (l: string) => setSelectedLocalities((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l])
  const toggleBHK = (b: string) => setSelectedBHK((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])

  const next = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]!)
    else setShowResults(true)
  }
  const back = () => {
    if (showResults) { setShowResults(false); return }
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]!)
  }

  if (showResults) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <button onClick={back} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" /> Back to quiz
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Perfect matches for you</h2>
          <p className="text-sm text-gray-500 mt-1">Based on your preferences near {office || 'Mindspace / Hitech City'}</p>
        </div>

        {/* Location & Budget filters row */}
        <div className="mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location - Hyderabad</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {LOCALITIES.map((l) => (
              <button
                key={l}
                onClick={() => toggleLocality(l)}
                className={cn('rounded-lg border px-3 py-1.5 text-sm transition-colors', selectedLocalities.includes(l) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <IndianRupee className="h-4 w-4 text-gray-400" />
            <span className="font-medium">Budget (₹/month)</span>
          </div>
          <div className="flex gap-3">
            <input value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="Min Budget" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            <input value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="Max Budget" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_RESULTS.map((p) => {
            const occ = Math.round((p.occupied / p.totalFlats) * 100)
            return (
              <div key={p.name} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="relative h-48">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">Gated Community</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                    <MapPin className="h-3 w-3" />
                    {p.distance}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-white/70">{p.locality}, Hyderabad</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-brand-500" />{p.bhk} BHK</span>
                    <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5 text-brand-500" />{p.sqft} sq.ft</span>
                    <span className="flex items-center gap-1"><Sofa className="h-3.5 w-3.5 text-brand-500" />{p.furnishing}</span>
                    <span className="flex items-center gap-1 text-green-600"><ShieldCheck className="h-3.5 w-3.5" />Verified</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs mb-2">
                    <div><div className="text-gray-400 uppercase font-medium">Total Flats</div><div className="font-bold text-gray-900">{p.totalFlats}</div></div>
                    <div><div className="text-gray-400 uppercase font-medium">Occupied</div><div className="font-bold text-gray-900">{p.occupied}</div></div>
                    <div><div className="text-gray-400 uppercase font-medium">Occupancy</div><div className={cn('font-bold', occ >= 90 ? 'text-green-600' : 'text-amber-600')}>{occ}%</div></div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 mb-3">
                    <div className={cn('h-1.5 rounded-full', occ >= 90 ? 'bg-green-500' : 'bg-amber-500')} style={{ width: `${occ}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.landmarks.map((l) => <span key={l} className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-500">{l}</span>)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Hero card */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 mb-0 text-white">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3 w-3" /> Tenant Match
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Flat</h1>
          <p className="text-white/80 text-sm">Answer a few quick questions and we&apos;ll curate the best matches for you in Hyderabad.</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-b-full mb-0 overflow-hidden">
          <div className="h-full bg-brand-600 rounded-b-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Step card */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm mt-0 p-8">
          {step === 'office' && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <Briefcase className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Where is your office located?</h2>
              <p className="text-sm text-gray-400 mb-6">We&apos;ll find properties that make your daily commute a breeze.</p>
              <div className="grid grid-cols-2 gap-3">
                {OFFICE_LOCATIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setOffice(l)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all',
                      office === l ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'location' && (
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <MapPin className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Preferred locality?</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">Select one or more areas in Hyderabad.</p>
              <div className="grid grid-cols-2 gap-3">
                {LOCALITIES.map((l) => (
                  <button
                    key={l}
                    onClick={() => toggleLocality(l)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm font-medium text-left transition-all',
                      selectedLocalities.includes(l) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'budget' && (
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <IndianRupee className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">What&apos;s your budget?</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">Monthly rent in ₹</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Min Budget</label>
                  <input
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Max Budget</label>
                  <input
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="e.g. 35000"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'bhk' && (
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <Bed className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">How many bedrooms?</h2>
              <p className="text-sm text-gray-400 mb-6 text-center">Select all that you&apos;re open to.</p>
              <div className="grid grid-cols-2 gap-3">
                {BHK_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBHK(b)}
                    className={cn(
                      'rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all',
                      selectedBHK.includes(b) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {stepIndex > 0 ? (
              <button onClick={back} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}
            <button
              onClick={next}
              disabled={step === 'office' && !office}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {stepIndex === STEPS.length - 1 ? 'Find My Flat' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="mt-4 flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className={cn('h-2 rounded-full transition-all', i === stepIndex ? 'w-6 bg-brand-600' : i < stepIndex ? 'w-2 bg-brand-300' : 'w-2 bg-gray-200')} />
          ))}
        </div>
      </div>
    </div>
  )
}
