'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HYDERABAD_LOCALITIES } from '@urbangar/config'
import { cn } from '@/lib/utils'

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK']
const BUDGET_OPTIONS = [
  { label: 'Any', value: '' },
  { label: 'Under ₹10K', value: '0-10000' },
  { label: '₹10K–₹20K', value: '10000-20000' },
  { label: '₹20K–₹40K', value: '20000-40000' },
  { label: '₹40K+', value: '40000-' },
]

export function SearchBar() {
  const router = useRouter()
  const [locality, setLocality] = useState('')
  const [bhk, setBhk] = useState('')
  const [budget, setBudget] = useState('')
  const [localitySuggestions, setLocalitySuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleLocalityChange = (value: string) => {
    setLocality(value)
    if (value.length > 0) {
      const filtered = HYDERABAD_LOCALITIES.filter((l) =>
        l.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6)
      setLocalitySuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (locality) params.set('locality', locality)
    if (bhk) {
      // '4+ BHK' → minBhk=4 (open-ended), '2 BHK' → bhk=2
      const cleaned = bhk.replace(' BHK', '')
      if (cleaned.endsWith('+')) {
        params.set('minBhk', cleaned.replace('+', ''))
      } else {
        params.set('bhk', cleaned)
      }
    }
    if (budget) {
      const [min, max] = budget.split('-')
      if (min) params.set('minPrice', min)
      if (max) params.set('maxPrice', max)
    }
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/30 sm:flex-row sm:items-center"
    >
      {/* Locality input */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="h-4 w-4 text-brand-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search locality, e.g. Gachibowli"
          value={locality}
          onChange={(e) => handleLocalityChange(e.target.value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="h-12 w-full rounded-xl bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        {showSuggestions && localitySuggestions.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            {localitySuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                onMouseDown={() => {
                  setLocality(s)
                  setShowSuggestions(false)
                }}
              >
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden h-8 w-px bg-gray-100 sm:block" />

      {/* BHK selector */}
      <div className="relative">
        <select
          value={bhk}
          onChange={(e) => setBhk(e.target.value)}
          className="h-12 rounded-xl bg-gray-50 pl-4 pr-8 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none cursor-pointer"
        >
          <option value="">Any BHK</option>
          {BHK_OPTIONS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Divider */}
      <div className="hidden h-8 w-px bg-gray-100 sm:block" />

      {/* Budget selector */}
      <div className="relative">
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="h-12 rounded-xl bg-gray-50 pl-4 pr-8 text-sm text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 appearance-none cursor-pointer"
        >
          {BUDGET_OPTIONS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      <Button type="submit" size="lg" className="h-12 shrink-0 gap-2 sm:px-6">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  )
}
