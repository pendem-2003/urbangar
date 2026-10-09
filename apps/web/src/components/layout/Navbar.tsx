'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@urbangar/types'
import { cn } from '@/lib/utils'

const DASHBOARD_ROUTES: Record<string, string> = {
  [Role.SEEKER]: '/seeker/dashboard',
  [Role.OWNER]: '/owner/dashboard',
  [Role.BROKER]: '/broker/dashboard',
  [Role.PROVIDER]: '/provider/dashboard',
  [Role.ADMIN]: '/admin/dashboard',
}

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const authed = _hasHydrated && isAuthenticated
  const dashboardPath = user ? DASHBOARD_ROUTES[user.role] ?? '/login' : '/login'

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white">
            <span className="text-xs font-bold">UG</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            Urban <span className="text-brand-600">Gar</span>
          </span>
        </Link>

        {/* Search — desktop */}
        <div className="relative flex-1 max-w-xl mx-4 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties, tenants, documents..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
          />
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/properties?listingFor=RENT" className="hidden md:block rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Rent
          </Link>
          <Link href="/properties?listingFor=SALE" className="hidden md:block rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Buy
          </Link>

          {/* Gated Communities */}
          <Link
            href={authed && user?.role === Role.OWNER ? '/owner/dashboard' : '/login'}
            className="hidden md:flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Gated Communities
          </Link>

          {/* PG/Hostel */}
          <Link href="/pg" className="hidden md:flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            PG/Hostel
          </Link>

          {/* Auth */}
          {authed && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full p-1.5 hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700">
                  {user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 hidden md:block transition-transform', userMenuOpen && 'rotate-180')} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-100 bg-white shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{user.name ?? 'User'}</p>
                    <p className="text-xs text-gray-400">{user.role.toLowerCase()}</p>
                  </div>
                  <div className="p-1">
                    <Link href={dashboardPath} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <button onClick={() => { setUserMenuOpen(false); logout() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Log in
              </Link>
              <Link href="/register" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
                Get started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <div className="relative mt-3 mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input placeholder="Search..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none" />
          </div>
          <nav className="flex flex-col gap-1">
            {[{ href: '/properties?listingFor=RENT', label: 'Rent' }, { href: '/properties?listingFor=SALE', label: 'Buy' }, { href: '/pg', label: 'PG/Hostel' }].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
            {authed ? (
              <>
                <Link href={dashboardPath} onClick={() => setMobileOpen(false)} className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700">
                  Dashboard
                </Link>
                <button onClick={logout} className="rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-600">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
