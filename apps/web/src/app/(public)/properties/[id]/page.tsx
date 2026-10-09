import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PropertyDetailClient } from './PropertyDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Property Details — UrbanGar',
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center text-gray-400">Loading property...</div>}>
      <PropertyDetailClient id={id} />
    </Suspense>
  )
}
