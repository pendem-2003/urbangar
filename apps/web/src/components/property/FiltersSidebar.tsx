'use client'

import { cn } from '@/lib/utils'
import type { PropertyFilters, FurnishingStatus } from '@urbangar/types'
import { HYDERABAD_LOCALITIES } from '@urbangar/config'

interface FiltersSidebarProps {
  filters: PropertyFilters
  onUpdate: (key: string, value: string | undefined) => void
  onBatchUpdate: (updates: Record<string, string | undefined>) => void
}

const BHK_OPTIONS = [1, 2, 3, 4]
const FURNISHING_OPTIONS = [
  { value: 'FULLY_FURNISHED', label: 'Fully furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
]
const BUDGET_RANGES = [
  { label: 'Under ₹10,000', min: '0', max: '10000' },
  { label: '₹10,000 – ₹20,000', min: '10000', max: '20000' },
  { label: '₹20,000 – ₹40,000', min: '20000', max: '40000' },
  { label: '₹40,000+', min: '40000', max: '' },
]

export function FiltersSidebar({ filters, onUpdate, onBatchUpdate }: FiltersSidebarProps) {
  const activeBhk = filters.bhk ?? []

  const toggleBhk = (value: number) => {
    const current = activeBhk.includes(value)
      ? activeBhk.filter((b) => b !== value)
      : [...activeBhk, value]
    onUpdate('bhk', current.join(',') || undefined)
  }

  const setbudget = (active: boolean, min: string, max: string) => {
    // Both minPrice and maxPrice in one push so they don't race each other
    onBatchUpdate({
      minPrice: active ? undefined : (min !== '' ? min : undefined),
      maxPrice: active ? undefined : (max !== '' ? max : undefined),
    })
  }

  return (
    <div className="sticky top-32 flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="font-semibold text-gray-900">Filters</h2>

      {/* Listing type */}
      <FilterSection title="Looking for">
        <div className="flex gap-2">
          {(['RENT', 'SALE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onUpdate('listingFor', filters.listingFor === type ? undefined : type)}
              className={cn(
                'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                filters.listingFor === type
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {type === 'RENT' ? 'Rent' : 'Buy'}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Locality */}
      <FilterSection title="Locality">
        <select
          value={filters.locality ?? ''}
          onChange={(e) => onUpdate('locality', e.target.value || undefined)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All localities</option>
          {HYDERABAD_LOCALITIES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </FilterSection>

      {/* BHK */}
      <FilterSection title="BHK">
        <div className="flex gap-2">
          {BHK_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => toggleBhk(b)}
              className={cn(
                'h-9 w-full rounded-lg border text-sm font-medium transition-colors',
                activeBhk.includes(b)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {b}{b === 4 ? '+' : ''}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Budget */}
      <FilterSection title="Budget (rent/mo)">
        <div className="flex flex-col gap-1.5">
          {BUDGET_RANGES.map((range) => {
            const minMatch = range.min === '' ? filters.minPrice === undefined : String(filters.minPrice ?? 'x') === range.min
            const maxMatch = range.max === '' ? filters.maxPrice === undefined : String(filters.maxPrice ?? 'x') === range.max
            const active = minMatch && maxMatch
            return (
              <button
                key={range.label}
                onClick={() => setbudget(active, range.min, range.max)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                )}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Furnishing */}
      <FilterSection title="Furnishing">
        <div className="flex flex-col gap-1.5">
          {FURNISHING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-600 accent-brand-600"
                checked={filters.furnishing?.includes(opt.value as FurnishingStatus) ?? false}
                onChange={(e) => {
                  const current = filters.furnishing ?? []
                  const next = e.target.checked
                    ? [...current, opt.value]
                    : current.filter((f) => f !== opt.value)
                  onUpdate('furnishing', next.join(',') || undefined)
                }}
              />
              <span className="text-sm text-gray-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </div>
  )
}
