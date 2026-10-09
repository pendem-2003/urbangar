import Link from 'next/link'

const LINKS = {
  Platform: [
    { label: 'Find a flat', href: '/properties?listingFor=RENT' },
    { label: 'Buy property', href: '/properties?listingFor=SALE' },
    { label: 'PG / Hostel', href: '/pg' },
    { label: 'Home services', href: '/services' },
  ],
  'For owners': [
    { label: 'List your property', href: '/list-property' },
    { label: 'Owner dashboard', href: '/owner/dashboard' },
    { label: 'Rent collection', href: '/owner/dashboard' },
    { label: 'Maintenance', href: '/owner/dashboard' },
  ],
  Company: [
    { label: 'About us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ],
  Legal: [
    { label: 'Terms of use', href: '/terms' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Refund policy', href: '/refunds' },
    { label: 'Grievance officer', href: '/grievance' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
                UG
              </div>
              <span className="font-bold text-gray-900">
                Urban<span className="text-brand-600">Gar</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Hyderabad&apos;s trusted platform for finding homes, managing rentals, and booking home services.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col items-center gap-2 text-xs text-gray-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} UrbanGar. All rights reserved.</p>
          <p>Made with ❤️ in Hyderabad</p>
        </div>
      </div>
    </footer>
  )
}
