'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: string[]
  title: string
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (photos.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-gray-100">
        <span className="text-sm text-gray-400">No photos available</span>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent((c) => (c + 1) % photos.length)

  return (
    <>
      {/* Main gallery grid */}
      <div className="grid h-80 grid-cols-4 gap-2 overflow-hidden rounded-2xl sm:h-96">
        {/* Main photo */}
        <div
          className="relative col-span-2 row-span-2 cursor-pointer overflow-hidden bg-gray-100 sm:col-span-3"
          onClick={() => { setCurrent(0); setLightboxOpen(true) }}
        >
          <Image
            src={photos[0]!}
            alt={`${title} - photo 1`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 50vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
        </div>

        {/* Side thumbnails */}
        {photos.slice(1, 3).map((photo, i) => (
          <div
            key={i}
            className="relative cursor-pointer overflow-hidden bg-gray-100"
            onClick={() => { setCurrent(i + 1); setLightboxOpen(true) }}
          >
            <Image
              src={photo}
              alt={`${title} - photo ${i + 2}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="20vw"
            />
          </div>
        ))}

        {/* Show more overlay on last thumbnail */}
        {photos.length > 3 && photos[3] && (
          <div
            className="relative cursor-pointer overflow-hidden bg-gray-100"
            onClick={() => { setCurrent(3); setLightboxOpen(true) }}
          >
            <Image
              src={photos[3]}
              alt={`${title} - photo 4`}
              fill
              className="object-cover"
              sizes="20vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Expand className="mx-auto mb-1 h-5 w-5" />
                <span className="text-sm font-semibold">+{photos.length - 3} more</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[80vh] w-full max-w-4xl px-16">
            <Image
              src={photos[current]!}
              alt={`${title} - photo ${current + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <button
            onClick={next}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 text-sm text-white/60">
            {current + 1} / {photos.length}
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-12 flex gap-2 overflow-x-auto px-4">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-opacity',
                  i === current ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                )}
              >
                <Image src={photo} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
