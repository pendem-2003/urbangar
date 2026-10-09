'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Settings, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface PlatformConfigItem {
  id: string
  key: string
  value: string
  description: string | null
  updatedAt: string
}

const CONFIG_LABELS: Record<string, { label: string; description: string; type: 'toggle' | 'number' | 'text' }> = {
  onboardingFeeEnabled: { label: 'Onboarding fee', description: 'Charge owners a one-time listing fee', type: 'toggle' },
  rentCommissionEnabled: { label: 'Rent commission', description: 'Deduct platform commission from monthly rent', type: 'toggle' },
  rentCommissionPct: { label: 'Rent commission %', description: 'Percentage deducted from monthly rent (e.g. 2)', type: 'number' },
  brokerOnboardingFeeEnabled: { label: 'Broker onboarding fee', description: 'Charge brokers to join the platform', type: 'toggle' },
  seekerVerificationFeeEnabled: { label: 'Seeker verification fee', description: 'Charge seekers for KYC verification', type: 'toggle' },
  premiumListingEnabled: { label: 'Premium listings', description: 'Allow owners to pay for featured placement', type: 'toggle' },
  maintenanceMarkupEnabled: { label: 'Maintenance markup', description: 'Add platform markup on maintenance job payments', type: 'toggle' },
  maintenanceMarkupPct: { label: 'Maintenance markup %', description: 'Percentage markup on maintenance billing', type: 'number' },
  serviceBookingFeeEnabled: { label: 'Service booking fee', description: 'Charge seekers for marketplace service bookings', type: 'toggle' },
  providerOnboardingFeeEnabled: { label: 'Provider onboarding fee', description: 'Charge service providers to join', type: 'toggle' },
  maxPhotosPerListing: { label: 'Max photos per listing', description: 'Hard limit on photos per property', type: 'number' },
  maxActiveListingsPerOwner: { label: 'Max listings per owner', description: 'Soft limit for free tier owners', type: 'number' },
  visitConfirmationWindowHours: { label: 'Visit confirmation window (hrs)', description: 'Hours before visit to auto-confirm', type: 'number' },
  nudgeCooldownHours: { label: 'Nudge cooldown (hrs)', description: 'Min hours between nudges to same user', type: 'number' },
}

export default function AdminConfigPage() {
  const queryClient = useQueryClient()

  const { data: configs, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: async () => {
      const { data } = await api.get('/admin/config')
      return data.data as PlatformConfigItem[]
    },
  })

  const update = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.patch('/admin/config', { key, value }),
    onSuccess: (_, vars) => {
      toast.success(`Updated: ${CONFIG_LABELS[vars.key]?.label ?? vars.key}`)
      queryClient.invalidateQueries({ queryKey: ['admin-config'] })
    },
    onError: () => toast.error('Failed to update config'),
  })

  const configMap = new Map(configs?.map((c) => [c.key, c.value]) ?? [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Platform Configuration</h1>
        <p className="text-sm text-gray-400">Toggle features and fees without code changes</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(CONFIG_LABELS).map(([key, meta]) => {
            const value = configMap.get(key) ?? ''
            return (
              <ConfigRow
                key={key}
                configKey={key}
                value={value}
                meta={meta}
                onUpdate={(val) => update.mutate({ key, value: val })}
                updating={update.isPending && update.variables?.key === key}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

interface ConfigRowProps {
  configKey: string
  value: string
  meta: { label: string; description: string; type: 'toggle' | 'number' | 'text' }
  onUpdate: (value: string) => void
  updating: boolean
}

function ConfigRow({ configKey, value, meta, onUpdate, updating }: ConfigRowProps) {
  const isEnabled = value === 'true'

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{meta.label}</div>
          <div className="text-xs text-gray-400">{meta.description}</div>
        </div>
      </div>

      {meta.type === 'toggle' ? (
        <button
          onClick={() => onUpdate(isEnabled ? 'false' : 'true')}
          disabled={updating}
          className="shrink-0 transition-opacity disabled:opacity-60"
          aria-label={isEnabled ? 'Disable' : 'Enable'}
        >
          {isEnabled ? (
            <ToggleRight className="h-8 w-8 text-brand-600" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-gray-300" />
          )}
        </button>
      ) : (
        <input
          type="number"
          defaultValue={value}
          onBlur={(e) => {
            if (e.target.value !== value) onUpdate(e.target.value)
          }}
          className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-right text-sm text-gray-700 focus:border-brand-500 focus:outline-none"
        />
      )}
    </div>
  )
}
