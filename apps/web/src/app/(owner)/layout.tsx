'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { OwnerNav } from '@/components/layout/OwnerNav'
import { Role } from '@urbangar/types'

const DEV = process.env.NODE_ENV === 'development'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (DEV) return // Skip ALL auth checks in development
    if (!_hasHydrated) return
    if (!user) router.push('/login')
    else if (user.role !== Role.OWNER && user.role !== Role.ADMIN) router.push('/login')
  }, [user, _hasHydrated, router])

  // In dev: always render immediately. In prod: wait for hydration.
  if (!DEV && !_hasHydrated) return null

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <OwnerNav />
      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  )
}
