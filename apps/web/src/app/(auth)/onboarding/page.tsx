'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { HYDERABAD_LOCALITIES } from '@urbangar/config'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const SERVICE_CATEGORIES = [
  { value: 'COOK', label: 'Cook' },
  { value: 'MAID', label: 'Maid / House help' },
  { value: 'SECURITY', label: 'Security guard' },
  { value: 'LAUNDRY', label: 'Laundry' },
  { value: 'HOME_CLEANING', label: 'Home cleaning' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'PLUMBER', label: 'Plumber' },
  { value: 'PACKERS_MOVERS', label: 'Packers & movers' },
  { value: 'INTERIOR_DESIGNER', label: 'Interior designer' },
  { value: 'PHOTOGRAPHER', label: 'Photographer' },
  { value: 'ARCHITECT', label: 'Architect' },
  { value: 'VASTU', label: 'Vastu consultant' },
  { value: 'CYLINDER', label: 'LPG cylinder' },
  { value: 'OTHER', label: 'Other' },
]

const ROLE_ROUTES: Record<string, string> = {
  SEEKER: '/seeker/dashboard',
  OWNER: '/owner/dashboard',
  BROKER: '/broker/dashboard',
  PROVIDER: '/provider/dashboard',
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, _hasHydrated, setAuth, accessToken, refreshToken } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Base fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  // Broker-only
  const [reraNumber, setReraNumber] = useState('')
  const [brokerBio, setBrokerBio] = useState('')
  const [brokerAreas, setBrokerAreas] = useState<string[]>([])
  // Provider-only
  const [category, setCategory] = useState('')
  const [providerBio, setProviderBio] = useState('')
  const [providerAreas, setProviderAreas] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [experienceYears, setExperienceYears] = useState('')

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) { router.push('/login'); return }
    // Already onboarded (has a name) — go to dashboard
    if (user.name) { router.push(ROLE_ROUTES[user.role] ?? '/'); return }
  }, [user, _hasHydrated, router])

  if (!_hasHydrated || !user) return null

  const role = user.role

  const toggleArea = (area: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(area) ? list.filter((a) => a !== area) : [...list, area])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if (role === 'PROVIDER' && !category) { setError('Please select a service category'); return }
    setSubmitting(true)
    setError('')

    try {
      // 1. Update name + email for all roles
      await api.patch('/users/me', { name: name.trim(), email: email.trim() || undefined })

      // 2. Role-specific profile creation
      if (role === 'BROKER') {
        await api.patch('/broker/profile', {
          reraNumber: reraNumber.trim() || undefined,
          bio: brokerBio.trim() || undefined,
          serviceAreas: brokerAreas,
        })
      }

      if (role === 'PROVIDER') {
        await api.patch('/marketplace/profile', {
          category,
          bio: providerBio.trim() || undefined,
          areasServed: providerAreas,
          hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
        })
      }

      // 3. Re-fetch profile to update store name
      const profileRes = await api.get('/users/me')
      const profile = profileRes.data.data
      setAuth(
        { id: profile.id, phone: user.phone, name: profile.name, role: profile.role, avatarUrl: profile.avatarUrl },
        accessToken!,
        refreshToken!,
      )

      router.push(ROLE_ROUTES[role] ?? '/')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">UG</div>
            <span className="text-lg font-bold text-gray-900">Urban<span className="text-brand-600">Gar</span></span>
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">
            {role === 'BROKER' ? 'Set up your broker profile' :
             role === 'PROVIDER' ? 'Set up your service profile' :
             'Almost there!'}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {role === 'BROKER' ? 'Your profile will be reviewed before you can list properties.' :
             role === 'PROVIDER' ? 'Your profile will be reviewed before you appear to customers.' :
             'Just a few details to get you started.'}
          </p>

          {(role === 'BROKER' || role === 'PROVIDER') && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Your profile will be pending admin approval after submission.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Name — all roles */}
            <Field label="Full name *">
              <input
                className="input"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            {/* Email — all roles */}
            <Field label="Email address">
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            {/* ── Broker fields ─────────────────────────────── */}
            {role === 'BROKER' && (
              <>
                <Field label="RERA number" hint="Leave blank if not yet registered">
                  <input
                    className="input"
                    placeholder="e.g. A51800000001"
                    value={reraNumber}
                    onChange={(e) => setReraNumber(e.target.value)}
                  />
                </Field>
                <Field label="Bio">
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Tell owners about your experience and specialisation..."
                    value={brokerBio}
                    onChange={(e) => setBrokerBio(e.target.value)}
                  />
                </Field>
                <Field label="Service areas">
                  <LocalityPicker selected={brokerAreas} onToggle={(a) => toggleArea(a, brokerAreas, setBrokerAreas)} />
                </Field>
              </>
            )}

            {/* ── Provider fields ───────────────────────────── */}
            {role === 'PROVIDER' && (
              <>
                <Field label="Service category *">
                  <select
                    className="input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Hourly rate (₹)">
                    <input
                      type="number"
                      className="input"
                      placeholder="e.g. 300"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </Field>
                  <Field label="Years of experience">
                    <input
                      type="number"
                      className="input"
                      placeholder="e.g. 3"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea
                    className="input min-h-[80px] resize-none"
                    placeholder="Describe your services, experience, tools used..."
                    value={providerBio}
                    onChange={(e) => setProviderBio(e.target.value)}
                  />
                </Field>
                <Field label="Areas you serve">
                  <LocalityPicker selected={providerAreas} onToggle={(a) => toggleArea(a, providerAreas, setProviderAreas)} />
                </Field>
              </>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving…' : 'Complete setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function LocalityPicker({ selected, onToggle }: { selected: string[]; onToggle: (a: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-gray-200 p-3 max-h-40 overflow-y-auto">
      {HYDERABAD_LOCALITIES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => onToggle(loc)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            selected.includes(loc)
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  )
}
