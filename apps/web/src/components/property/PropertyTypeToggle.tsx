'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, Users } from 'lucide-react'

type PropertyMode = 'flat' | 'pg'

export function PropertyTypeToggle() {
  const [mode, setMode] = useState<PropertyMode>('flat')
  const router = useRouter()

  return (
    <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {(
        [
          { key: 'flat', label: 'Flats & Apartments', icon: Building2 },
          { key: 'pg', label: 'PG / Hostel', icon: Users },
        ] as const
      ).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150',
            mode === key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-white/60 hover:text-white/80'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
