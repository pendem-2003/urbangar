'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'
import {
  LayoutDashboard, Building2, Users, Bell, Settings,
  TrendingUp, Wrench, CreditCard, ChevronRight, LogOut, ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Role = 'BROKER' | 'OWNER' | 'SEEKER' | 'ADMIN' | 'PROVIDER'

const NAV_ITEMS: Record<Role, { href: string; label: string; icon: React.ReactNode }[]> = {
  BROKER: [
    { href: '/broker/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/broker/listings', label: 'My Listings', icon: <Building2 className="h-4 w-4" /> },
    { href: '/broker/leads', label: 'Leads & CRM', icon: <Users className="h-4 w-4" /> },
    { href: '/broker/nudges', label: 'Interested Leads', icon: <Bell className="h-4 w-4" /> },
    { href: '/broker/profile', label: 'Profile & RERA', icon: <Settings className="h-4 w-4" /> },
  ],
  OWNER: [
    { href: '/owner/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/owner/properties', label: 'My Properties', icon: <Building2 className="h-4 w-4" /> },
    { href: '/owner/tenants', label: 'Tenants', icon: <Users className="h-4 w-4" /> },
    { href: '/owner/rent', label: 'Rent Collection', icon: <CreditCard className="h-4 w-4" /> },
    { href: '/owner/maintenance', label: 'Maintenance', icon: <Wrench className="h-4 w-4" /> },
  ],
  SEEKER: [
    { href: '/seeker/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/seeker/saved', label: 'Saved Properties', icon: <Building2 className="h-4 w-4" /> },
    { href: '/seeker/lease', label: 'My Lease', icon: <TrendingUp className="h-4 w-4" /> },
    { href: '/seeker/payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/admin/approvals', label: 'Approvals', icon: <Building2 className="h-4 w-4" /> },
    { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { href: '/admin/config', label: 'Platform Config', icon: <Settings className="h-4 w-4" /> },
  ],
  PROVIDER: [
    { href: '/provider/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/provider/bookings', label: 'Bookings', icon: <Users className="h-4 w-4" /> },
    { href: '/provider/profile', label: 'Profile', icon: <Settings className="h-4 w-4" /> },
  ],
}

interface Props {
  role: Role
  children: React.ReactNode
  backHref?: string
  title?: string
}

export function DashboardShell({ role, children, backHref, title }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!_hasHydrated) return
    if (!user) {
      router.push('/login')
    } else if (user.role !== role && user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [user, role, router, _hasHydrated])

  if (!_hasHydrated) return null

  const navItems = NAV_ITEMS[role] ?? []

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-50 px-5">
          <Link href="/" className="text-lg font-bold text-brand-600">UrbanGar</Link>
        </div>

        {/* User info */}
        <div className="border-b border-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 truncate max-w-[110px]">{user?.name ?? 'User'}</div>
              <div className="text-xs text-gray-400">{role.charAt(0) + role.slice(1).toLowerCase()}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className={cn(active ? 'text-brand-600' : 'text-gray-400')}>{item.icon}</span>
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand-400" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-50 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {backHref && (
          <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-3">
            <Link href={backHref} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            {title && <span className="text-sm font-medium text-gray-800 truncate">{title}</span>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
