'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
  Building2, Home, TrendingUp, AlertCircle,
  Users, CreditCard, Wrench, Shield,
  Plus, UserPlus, Clock, ArrowRight,
  CheckCircle, Bell,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

/* ─── types ─────────────────────────────────────────── */
interface Summary {
  activeListings?: number
  totalFlats?: number
  rentCollectedThisMonth?: number
  openMaintenance?: number
}

interface NotifItem {
  id: string
  type: string
  title: string
  createdAt: string
}

/* ─── static sample data (used when API is unavailable) ─ */
const SAMPLE_UPDATES = [
  { id: '1', label: 'New tenant onboarded',         sub: 'Aparna Serene Park',   ring: 'border-green-500',  time: '2 hours ago' },
  { id: '2', label: 'Rent payment received',         sub: 'My Home Bhooja',       ring: 'border-green-500',  time: '4 hours ago' },
  { id: '3', label: 'Maintenance request',           sub: 'Prestige High Fields', ring: 'border-orange-400', time: '5 hours ago' },
  { id: '4', label: 'Tenant verification completed', sub: 'Lodha Meridian',       ring: 'border-green-500',  time: '1 day ago'   },
  { id: '5', label: 'Flat viewing inquiry',          sub: 'Rainbow Vistas',       ring: 'border-orange-400', time: '1 day ago'   },
]

const NOTIF_RING: Record<string, string> = {
  LISTING_APPROVED: 'border-green-500',
  CONTACT_REQUEST:  'border-green-500',
  VISIT_CONFIRMED:  'border-green-500',
  LISTING_REJECTED: 'border-red-400',
  GENERAL:          'border-green-500',
  NUDGE:            'border-orange-400',
}

/* ─── component ─────────────────────────────────────── */
export default function OwnerDashboardPage() {

  /* backend calls — pages still render when API is down */
  const { data: summary } = useQuery<Summary>({
    queryKey: ['owner-summary'],
    queryFn: async () => {
      const { data } = await api.get('/owner/summary')
      return data.data
    },
  })

  const { data: notifs } = useQuery<{ items: NotifItem[] }>({
    queryKey: ['notifications-recent'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { limit: 5 } })
      return data.data
    },
  })

  /* ── stat cards config ── */
  const stats = [
    {
      label:      'TOTAL PROPERTIES',
      value:      summary?.activeListings ? `${summary.activeListings} Communities` : '12 Communities',
      badge:      '+2 this month',
      icon:       Building2,
      iconBg:     'bg-blue-500',
      badgeBg:    'bg-blue-50',
      badgeColor: 'text-blue-600',
    },
    {
      label:      'TOTAL FLATS',
      value:      summary?.totalFlats?.toLocaleString('en-IN') ?? '1,240',
      badge:      '94% occupancy',
      icon:       Home,
      iconBg:     'bg-purple-500',
      badgeBg:    'bg-purple-50',
      badgeColor: 'text-purple-600',
    },
    {
      label:      'MONTHLY REVENUE',
      value:      `₹${((summary?.rentCollectedThisMonth ?? 8_450_000) / 100_000).toFixed(1)} Lakhs`,
      badge:      '+12% vs last month',
      icon:       TrendingUp,
      iconBg:     'bg-green-500',
      badgeBg:    'bg-green-50',
      badgeColor: 'text-green-600',
    },
    {
      label:      'PENDING ISSUES',
      value:      String(summary?.openMaintenance ?? 7),
      badge:      '3 urgent',
      icon:       AlertCircle,
      iconBg:     'bg-red-500',
      badgeBg:    'bg-red-50',
      badgeColor: 'text-red-500',
    },
  ]

  /* ── community services ── */
  const services = [
    { icon: Users,      label: 'Tenant Screening',    desc: 'Rigorous background checks for secure communities.',           iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
    { icon: CreditCard, label: 'Rent Collection',     desc: 'Automated billing and payment tracking for all flats.',        iconBg: 'bg-green-50',  iconColor: 'text-green-600'  },
    { icon: Wrench,     label: 'Facility Management', desc: 'Maintenance of common areas, amenities, and individual flats.',iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { icon: Shield,     label: 'Gate Security',       desc: 'Integrated visitor management and security systems.',          iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ]

  /* ── quick actions ── */
  const quickActions = [
    { icon: Plus,       label: 'Add Property', href: '/owner/properties/new' },
    { icon: UserPlus,   label: 'New Tenant',   href: '/owner/tenants/new'    },
    { icon: CreditCard, label: 'Record Rent',  href: '/owner/rent/record'    },
    { icon: AlertCircle,label: 'Report Issue', href: '/owner/maintenance/new'},
  ]

  /* ── live updates (API → sample fallback) ── */
  const liveUpdates: { id: string; label: string; sub: string; ring: string; time: string }[] =
    notifs?.items?.length
      ? notifs.items.slice(0, 5).map((n) => ({
          id:    n.id,
          label: n.title,
          sub:   '',
          ring:  NOTIF_RING[n.type] ?? 'border-green-500',
          time:  formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
        }))
      : SAMPLE_UPDATES

  /* ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ════ HERO BANNER ════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 h-[420px]">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=80"
          alt="Gated Community"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="relative z-10 flex h-full flex-col justify-end p-8">
          {/* badge */}
          <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white tracking-wide">
            HYDERABAD&apos;S PREMIER
          </span>

          {/* heading */}
          <h1 className="text-5xl font-bold leading-tight text-white mb-3">
            Elevating Gated<br />Community Living
          </h1>

          {/* sub */}
          <p className="mb-5 max-w-lg text-sm text-white/80">
            Comprehensive management for Hyderabad&apos;s finest residential communities.
            Streamlining operations for owners and residents in Gachibowli, Hitech City, and beyond.
          </p>

          {/* buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/owner/properties"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Explore Properties
            </Link>
            <Link
              href="/owner/dashboard"
              className="rounded-full border border-white/50 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Owner Dashboard
            </Link>
          </div>

          {/* trust badges */}
          <div className="mt-5 flex items-center gap-6">
            {([['Verified Tenants', CheckCircle], ['24/7 Support', Clock], ['Instant Payments', CreditCard]] as const).map(
              ([label, Icon]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-white/80">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ════ STAT CARDS ═════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={cn('rounded-xl p-3', s.iconBg)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', s.badgeBg, s.badgeColor)}>
                  {s.badge}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* ════ BOTTOM GRID ════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Community Services ─ spans 2 cols */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Community Services</h2>
              <p className="text-sm text-gray-400 mt-0.5">End-to-end solutions for Hyderabad properties</p>
            </div>
            <Link
              href="/owner/services"
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline mt-1"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 hover:border-brand-200 transition-colors"
                >
                  <div className={cn('rounded-lg p-2 shrink-0', s.iconBg)}>
                    <Icon className={cn('h-4 w-4', s.iconColor)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                    <p className="mt-0.5 text-xs text-gray-400 leading-snug">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Live Updates */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Live Updates</h3>
              <Bell className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-4">
              {liveUpdates.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={cn('mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 bg-white', item.ring)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-gray-900 leading-snug">{item.label}</p>
                      <p className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{item.time}</p>
                    </div>
                    {item.sub && <p className="mt-0.5 text-xs text-gray-400">{item.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a) => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/25 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {a.label}
                  </Link>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
