import Link from 'next/link'
import { MapPin } from 'lucide-react'

const FEATURED = [
  { name: 'Gachibowli', count: '120+ listings', slug: 'gachibowli', color: 'from-blue-50 to-indigo-50 border-blue-100' },
  { name: 'Kondapur', count: '95+ listings', slug: 'kondapur', color: 'from-purple-50 to-violet-50 border-purple-100' },
  { name: 'Madhapur', count: '140+ listings', slug: 'madhapur', color: 'from-orange-50 to-amber-50 border-orange-100' },
  { name: 'Hitech City', count: '80+ listings', slug: 'hitech-city', color: 'from-green-50 to-emerald-50 border-green-100' },
  { name: 'Banjara Hills', count: '60+ listings', slug: 'banjara-hills', color: 'from-pink-50 to-rose-50 border-pink-100' },
  { name: 'Kukatpally', count: '75+ listings', slug: 'kukatpally', color: 'from-cyan-50 to-sky-50 border-cyan-100' },
]

export function FeaturedLocalities() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Popular localities</h2>
          <p className="mt-1 text-sm text-gray-500">Browse properties by Hyderabad&apos;s top neighbourhoods</p>
        </div>
        <Link
          href="/properties"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FEATURED.map((locality) => (
          <Link
            key={locality.slug}
            href={`/properties?locality=${encodeURIComponent(locality.name)}`}
            className={`group flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${locality.color}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
              <MapPin className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{locality.name}</p>
              <p className="text-xs text-gray-500">{locality.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
