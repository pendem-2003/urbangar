'use client'

import { useEffect, useRef } from 'react'

interface BlurredMapProps {
  lat: number
  lng: number
  locality: string
}

export function BlurredMap({ lat, lng, locality }: BlurredMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let destroyed = false

    const init = async () => {
      const L = (await import('leaflet')).default

      if (destroyed || !mapRef.current) return

      // Remove any stale Leaflet instance on this container (Strict Mode double-invoke)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) {
        (mapInstanceRef.current as L.Map | null)?.remove()
        mapInstanceRef.current = null
      }

      if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        keyboard: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map)

      L.circle([lat, lng], {
        color: '#4f46e5',
        fillColor: '#6366f1',
        fillOpacity: 0.15,
        radius: 500,
        weight: 2,
      }).addTo(map)

      mapInstanceRef.current = map
    }

    init().catch(console.error)

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as L.Map).remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng])

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div ref={mapRef} className="h-56 w-full" />
      {/* Blur overlay on edges */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/20 to-transparent" />
    </div>
  )
}
