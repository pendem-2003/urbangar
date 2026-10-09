import Link from 'next/link'
import { ChefHat, Sparkles, Wrench, Package, Truck, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SERVICES = [
  { icon: ChefHat, label: 'Cook', href: '/services?category=COOK', color: 'bg-orange-50 text-orange-600' },
  { icon: Sparkles, label: 'Maid', href: '/services?category=MAID', color: 'bg-blue-50 text-blue-600' },
  { icon: Wrench, label: 'Plumber', href: '/services?category=PLUMBER', color: 'bg-gray-50 text-gray-600' },
  { icon: Package, label: 'Cylinder', href: '/services?category=CYLINDER', color: 'bg-green-50 text-green-600' },
  { icon: Truck, label: 'Packers & Movers', href: '/services?category=PACKERS_MOVERS', color: 'bg-purple-50 text-purple-600' },
  { icon: Palette, label: 'Interior Designer', href: '/services?category=INTERIOR_DESIGNER', color: 'bg-pink-50 text-pink-600' },
]

export function ServicesTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-12 sm:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Home services marketplace
            </div>
            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
              Everything you need for your home
            </h2>
            <p className="text-white/60">
              From daily cooks and maids to architects and interior designers — find and book
              verified professionals in minutes.
            </p>
            <div className="mt-6">
              <Link href="/services">
                <Button variant="outline" size="md" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  Browse all services →
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            {SERVICES.map((service) => (
              <Link
                key={service.label}
                href={service.href}
                className="group flex flex-col items-center gap-2 rounded-xl bg-white/5 p-4 text-center transition-all hover:bg-white/10"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.color}`}>
                  <service.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-white/70 group-hover:text-white/90">
                  {service.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
