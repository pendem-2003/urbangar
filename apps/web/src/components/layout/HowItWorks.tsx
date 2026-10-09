import { Search, UserCheck, FileText, Home } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Search & discover',
    description: 'Browse verified flats and PGs with detailed filters. View photos, amenities, and locality info.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: UserCheck,
    title: 'Connect with broker',
    description: 'Chat with or call the assigned broker. Schedule a visit directly from the app.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: FileText,
    title: 'Verify & sign',
    description: 'Complete background verification, sign the digital rental agreement securely.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Home,
    title: 'Move in & manage',
    description: 'Pay rent online, raise maintenance requests, and book home services — all in one place.',
    color: 'bg-green-50 text-green-600',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How it works</h2>
          <p className="mt-2 text-gray-500">From search to move-in in 4 simple steps</p>
        </div>

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop) */}
          <div className="absolute left-0 top-10 hidden h-0.5 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent lg:block" />

          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {/* Step number */}
              <div className="relative mb-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} ring-4 ring-white`}>
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-1.5 font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
