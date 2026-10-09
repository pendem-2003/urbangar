import { ReactNode } from 'react'

interface HomeHeroProps {
  children: ReactNode
}

export function HomeHero({ children }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950 text-white">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Hyderabad&apos;s trusted property platform
          </div>

          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find your perfect{' '}
            <span className="bg-gradient-to-r from-brand-400 to-orange-400 bg-clip-text text-transparent">
              home
            </span>{' '}
            in Hyderabad
          </h1>

          <p className="mb-8 text-lg text-white/60 sm:text-xl">
            Verified flats, PGs, and villas. Connect with trusted brokers, pay rent online,
            and manage everything in one place.
          </p>

          {/* Search slot */}
          <div className="mx-auto max-w-2xl">{children}</div>

          {/* Trust stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            {[
              { value: '500+', label: 'Active listings' },
              { value: '50+', label: 'Verified brokers' },
              { value: '1000+', label: 'Happy tenants' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="font-semibold text-white/80">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
