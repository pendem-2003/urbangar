'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProperty, useToggleSave } from '@/hooks/useProperty'
import { useAuthStore } from '@/store/auth.store'
import { PhotoGallery } from '@/components/property/PhotoGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlurredMap } from '@/components/property/BlurredMap'
import { api } from '@/lib/api'
import {
  MapPin, Heart, Phone, MessageSquare, Bed, Bath, Maximize,
  Building2, CheckCircle2, Eye, Share2, ChevronLeft, Shield
} from 'lucide-react'
import { formatPrice, formatPricePerMonth, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props { id: string }

export function PropertyDetailClient({ id }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: property, isLoading, isError } = useProperty(id)
  const toggleSave = useToggleSave(id)
  const [showContactModal, setShowContactModal] = useState(false)
  const [localSaved, setLocalSaved] = useState<boolean | null>(null)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
        <div className="mt-6 space-y-3">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-1/3 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Building2 className="mb-4 h-16 w-16 text-gray-200" />
        <h2 className="text-xl font-semibold text-gray-700">Property not found</h2>
        <p className="mt-2 text-sm text-gray-400">This listing may have been removed or is unavailable.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  const p = property
  // API returns primaryBroker (from brokerAssignments[0])
  const broker = p.primaryBroker
  const isPG = p.type === 'PG' || p.type === 'HOSTEL'
  const price = p.listingFor === 'SALE' ? p.salePrice : p.monthlyRent
  // savedByMe not yet returned by API — use local optimistic state
  const isSaved = localSaved ?? false

  const handleContact = () => {
    if (!user) { router.push('/login'); return }
    setShowContactModal(true)
  }

  const handleSave = () => {
    if (!user) { router.push('/login'); return }
    const next = !isSaved
    setLocalSaved(next)
    toggleSave.mutate(undefined, {
      onSuccess: () => toast.success(next ? 'Saved to shortlist' : 'Removed from saved'),
      onError: () => { setLocalSaved(!next); toast.error('Failed to save') },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </button>

        <PhotoGallery photos={p.photos ?? []} title={p.title} />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & badges */}
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant={p.listingFor === 'RENT' ? 'default' : 'secondary'}>
                  {p.listingFor === 'RENT' ? 'For Rent' : 'For Sale'}
                </Badge>
                {p.type && <Badge variant="outline">{p.type.replace('_', ' ')}</Badge>}
                {p.status === 'ACTIVE' && (
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-brand-500" />
                <span>{p.locality}, Hyderabad</span>
                {p.viewCount > 0 && (
                  <span className="ml-3 flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    {p.viewCount} views
                  </span>
                )}
              </div>
            </div>

            {/* Specs strip */}
            <div className="flex flex-wrap gap-6 rounded-xl border border-gray-100 bg-white p-4">
              {p.bhk && <Spec icon={<Bed className="h-4 w-4" />} label={`${p.bhk} BHK`} />}
              {p.bathrooms && <Spec icon={<Bath className="h-4 w-4" />} label={`${p.bathrooms} Bathroom${p.bathrooms > 1 ? 's' : ''}`} />}
              {p.totalAreaSqft && <Spec icon={<Maximize className="h-4 w-4" />} label={`${p.totalAreaSqft} sqft`} />}
              {p.furnishing && (
                <Spec icon={<Building2 className="h-4 w-4" />} label={p.furnishing.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())} />
              )}
            </div>

            {/* Description */}
            {p.description && (
              <Section title="About this property">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{p.description}</p>
              </Section>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <Section title="Amenities">
                <div className="flex flex-wrap gap-2">
                  {p.amenities.map((amenity: string) => (
                    <span key={amenity} className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs text-gray-600">
                      <CheckCircle2 className="h-3 w-3 text-brand-500" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* PG details */}
            {isPG && (
              <Section title="PG Details">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.genderPreference && (
                    <DetailItem label="Gender" value={
                      p.genderPreference === 'ANY' ? 'Co-ed' :
                      p.genderPreference === 'MALE' ? 'Boys only' : 'Girls only'
                    } />
                  )}
                  {p.mealsIncluded !== undefined && (
                    <DetailItem label="Meals" value={p.mealsIncluded ? 'Included' : 'Not included'} />
                  )}
                  {/* API field is petFriendly, not petsAllowed */}
                  {p.petFriendly !== undefined && (
                    <DetailItem label="Pets" value={p.petFriendly ? 'Allowed' : 'Not allowed'} />
                  )}
                </div>
              </Section>
            )}

            {/* Blurred map */}
            <Section title="Location">
              <p className="mb-3 flex items-center gap-1.5 text-xs text-amber-600">
                <Shield className="h-3.5 w-3.5" />
                Exact location shared after booking a site visit
              </p>
              {p.latitude && p.longitude ? (
                <BlurredMap lat={p.latitude} lng={p.longitude} locality={p.locality} />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
                  Map not available
                </div>
              )}
            </Section>
          </div>

          {/* Right column: Contact card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {/* Price */}
              <div className="mb-4 border-b border-gray-50 pb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {price
                    ? (p.listingFor === 'SALE' ? formatPrice(price) : formatPricePerMonth(price))
                    : 'Price on request'}
                </div>
                {p.depositAmount && p.listingFor === 'RENT' && (
                  <div className="mt-1 text-xs text-gray-400">
                    + {formatPrice(p.depositAmount)} security deposit
                  </div>
                )}
                {p.maintenanceCharge > 0 && (
                  <div className="text-xs text-gray-400">
                    + {formatPrice(p.maintenanceCharge)}/mo maintenance
                  </div>
                )}
              </div>

              {/* Broker info — API field is primaryBroker */}
              {broker && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {broker.user?.name?.charAt(0) ?? 'B'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{broker.user?.name ?? 'Broker'}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>★ {broker.rating?.toFixed(1) ?? '4.5'}</span>
                      <span>·</span>
                      <span>{broker.totalDeals ?? 0} deals</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <Button size="lg" className="w-full gap-2" onClick={handleContact}>
                  <MessageSquare className="h-4 w-4" />
                  Contact now
                </Button>
                <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleContact}>
                  <Phone className="h-4 w-4" />
                  Request callback
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full gap-2"
                  onClick={handleSave}
                  disabled={toggleSave.isPending}
                >
                  <Heart className={cn('h-4 w-4', isSaved ? 'fill-red-500 text-red-500' : '')} />
                  {isSaved ? 'Saved' : 'Save to shortlist'}
                </Button>
              </div>

              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                <Shield className="mb-1 h-3.5 w-3.5" />
                Exact address unlocked after you confirm a site visit.
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied!')
                }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share this property
              </button>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          propertyId={id}
          propertyTitle={p.title}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  )
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span className="text-brand-500">{icon}</span>
      {label}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="font-medium text-gray-700">{value}</div>
    </div>
  )
}

function ContactModal({ propertyId, propertyTitle, onClose }: {
  propertyId: string
  propertyTitle: string
  onClose: () => void
}) {
  const [message, setMessage] = useState(`Hi, I'm interested in "${propertyTitle}". Please share more details.`)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    try {
      // Use shared api instance (handles auth token automatically)
      await api.post(`/bookings/contact/${propertyId}`, { message })
      toast.success('Message sent! The broker will contact you shortly.')
      onClose()
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact Broker</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-brand-500 focus:outline-none"
        />
        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button size="md" className="flex-1" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send message'}
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-gray-400">
          Your contact details will be shared with the broker
        </p>
      </div>
    </div>
  )
}
