'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EditPropertyForm } from '@/components/property/EditPropertyForm'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function OwnerEditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, isLoading } = useQuery({
    queryKey: ['property-edit', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}/owner`)
      return data.data
    },
  })

  return (
    <DashboardShell role="OWNER">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : data ? (
        <EditPropertyForm property={data} backHref="/owner/properties" />
      ) : (
        <p className="p-8 text-center text-gray-400">Property not found</p>
      )}
    </DashboardShell>
  )
}
