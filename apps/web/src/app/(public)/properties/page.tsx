import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PropertySearchPage } from './PropertySearchPage'

export const metadata: Metadata = {
  title: 'Properties for rent & sale in Hyderabad — UrbanGar',
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center text-gray-400">Loading...</div>}>
      <PropertySearchPage />
    </Suspense>
  )
}
