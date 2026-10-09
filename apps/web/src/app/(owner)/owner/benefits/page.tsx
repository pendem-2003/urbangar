import { Users, Key, CreditCard, Wrench, Shield, FileText, TrendingUp, Phone } from 'lucide-react'

const SERVICE_HIGHLIGHTS = [
  { icon: Users, label: 'Tenant Scouting', desc: 'Targeted advertising in IT hubs like Gachibowli & Hitech City', bg: 'bg-blue-50', color: 'text-blue-600' },
  { icon: CreditCard, label: 'Rent Collection', desc: 'Automated monthly collection & tracking', bg: 'bg-green-50', color: 'text-green-600' },
  { icon: Wrench, label: 'Maintenance', desc: 'End-to-end repairs and facility management', bg: 'bg-orange-50', color: 'text-orange-600' },
  { icon: Shield, label: 'Tenant Screening', desc: 'KYC, police verification & background checks', bg: 'bg-purple-50', color: 'text-purple-600' },
  { icon: FileText, label: 'Legal Documentation', desc: 'Rental agreements, NOC, and dispute handling', bg: 'bg-red-50', color: 'text-red-600' },
  { icon: TrendingUp, label: 'Revenue Optimization', desc: 'Market-based pricing & occupancy maximization', bg: 'bg-teal-50', color: 'text-teal-600' },
]

const BENEFITS = [
  { icon: '🛡️', title: 'Zero Vacancy Guarantee', desc: 'We guarantee your property stays rented within 30 days or we pay your rent.' },
  { icon: '💰', title: 'On-time Rent Every Month', desc: 'We collect from tenants and pay you by the 5th of every month, always.' },
  { icon: '🔧', title: 'Free Maintenance Handling', desc: 'All maintenance requests handled at no extra cost during your tenure.' },
  { icon: '📋', title: 'Legal Agreement Support', desc: 'Professionally drafted rental agreements and legal support included.' },
]

export default function OwnerBenefitsPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 px-8 py-12 text-center border border-brand-200">
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white px-4 py-1.5 text-sm font-medium text-brand-700">
            ✨ Premium Property Management
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Peace of Mind for Flat Owners</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From scouting tenants in Hitech City to maintaining your property, we handle it all with our comprehensive &ldquo;Urban Gar&rdquo; solution.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition-colors">
            List Your Property
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition-colors">
            <Phone className="h-4 w-4" />
            Talk to Us
          </button>
        </div>
      </div>

      {/* Comprehensive Owner Services */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Comprehensive Owner Services</h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-5">Tailored solutions for your property in Hyderabad</p>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Tenant Acquisition — photo card */}
          <div className="relative overflow-hidden rounded-2xl h-56">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80"
              alt="Tenant Acquisition"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Tenant Acquisition &amp; Screening</h3>
              <p className="text-white/80 text-sm mt-0.5">Finding the perfect match for your property in Hyderabad&apos;s prime locations.</p>
            </div>
          </div>

          {/* Rental & Property Management — photo card */}
          <div className="relative overflow-hidden rounded-2xl h-56">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80"
              alt="Rental Management"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
                <Key className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">Rental &amp; Property Management</h3>
              <p className="text-white/80 text-sm mt-0.5">End-to-end management ensuring your peace of mind.</p>
            </div>
          </div>
        </div>

        {/* Service highlights grid */}
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {SERVICE_HIGHLIGHTS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
                <div className={`rounded-lg p-2 shrink-0 ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Benefits */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Why Choose Urban Gar?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="text-3xl shrink-0">{b.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to stress-free ownership?</h2>
        <p className="text-white/80 mb-6">Join 500+ flat owners already using Urban Gar in Hyderabad</p>
        <button className="rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-gray-100 transition-colors">
          List Your Property — It&apos;s Free
        </button>
      </div>
    </div>
  )
}
