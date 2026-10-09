import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'UrbanGar — Find Your Perfect Home in Hyderabad',
    template: '%s | UrbanGar',
  },
  description:
    'Discover flats, PGs, and homes for rent or sale in Hyderabad. Verified listings, trusted brokers, and seamless rent management.',
  keywords: ['flats for rent hyderabad', 'pg in hyderabad', 'property for rent hyderabad'],
  metadataBase: new URL('https://urbangar.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://urbangar.com',
    siteName: 'UrbanGar',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
