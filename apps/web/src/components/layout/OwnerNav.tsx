'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  Search, LayoutDashboard, Building2, Home,
  Users, CreditCard, Wrench, ShoppingBag, Star,
  ChevronDown, LogOut, Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

const NAV_ITEMS = [
  { href: '/owner/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/owner/properties',   label: 'Properties',      icon: Building2        },
  { href: '/owner/find-home',    label: 'Find a Home',     icon: Home             },
  { href: '/owner/tenants',      label: 'Tenants',         icon: Users            },
  { href: '/owner/rent',         label: 'Rent Collection', icon: CreditCard       },
  { href: '/owner/maintenance',  label: 'Maintenance',     icon: Wrench           },
  { href: '/owner/services',     label: 'Services',        icon: ShoppingBag      },
  { href: '/owner/benefits',     label: 'Owner Benefits',  icon: Star             },
]

export function OwnerNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, logout } = useAuthStore()

  const [mode,     setMode]     = useState<'gated' | 'pg'>('gated')
  const [open,     setOpen]     = useState(false)
  const [search,   setSearch]   = useState('')
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeHref = NAV_ITEMS.find(
    (n) => pathname === n.href || (n.href !== '/owner/dashboard' && pathname.startsWith(n.href))
  )?.href

  const handleLogout = () => { logout(); router.push('/') }

  return (
    <header className="sticky top-0 z-50 w-full bg-white">

      {/* ── Top bar ─────────────────────────────── */}
      <div className="flex h-16 items-center gap-4 border-b border-gray-100 px-6">

        {/* Logo */}
        <Link href="/owner/dashboard" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white">
            <span className="text-xs font-bold tracking-tight">UG</span>
          </div>
          <span className="text-lg font-bold text-brand-600">Urban Gar</span>
        </Link>

        {/* Search */}
        <div className="relative mx-4 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties, tenants, documents..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
          />
        </div>

        {/* Mode toggles */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setMode('gated')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-semibold transition-all',
              mode === 'gated' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Gated Communities
          </button>
          <button
            onClick={() => setMode('pg')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-semibold transition-all',
              mode === 'pg' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            PG/Hostel
          </button>
        </div>

        {/* Notification bell */}
        <button className="relative shrink-0 rounded-full p-2 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User dropdown */}
        <div className="relative shrink-0" ref={dropRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full p-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg z-50">
              <div className="border-b border-gray-50 px-4 py-3">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.name ?? 'Owner'}</p>
                <p className="text-xs text-gray-400">{user?.phone ?? 'Property Owner'}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-nav tabs ─────────────────────────── */}
      <div className="flex items-stretch overflow-x-auto bg-white border-b border-gray-100 px-2 scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const Icon    = item.icon
          const isActive = activeHref === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-fit items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>

    </header>
  )
}
