import type { Metadata } from 'next'
import { HomeHero } from '@/components/layout/HomeHero'
import { PropertyTypeToggle } from '@/components/property/PropertyTypeToggle'
import { SearchBar } from '@/components/property/SearchBar'
import { FeaturedLocalities } from '@/components/property/FeaturedLocalities'
import { HowItWorks } from '@/components/layout/HowItWorks'
import { ServicesTeaser } from '@/components/layout/ServicesTeaser'

export const metadata: Metadata = {
  title: 'UrbanGar — Find Flats & PGs in Hyderabad',
  description:
    'Find verified flats, PGs and homes for rent or sale in Hyderabad. Connect directly with brokers, pay rent online, and manage your home — all in one place.',
}

export default function HomePage() {
  return (
    <main>
      <HomeHero>
        <PropertyTypeToggle />
        <SearchBar />
      </HomeHero>
      <FeaturedLocalities />
      <HowItWorks />
      <ServicesTeaser />
    </main>
  )
}
