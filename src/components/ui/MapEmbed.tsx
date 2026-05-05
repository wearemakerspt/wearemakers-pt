'use client'
import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  label: string
  address?: string | null
  height?: number
}

export default function MapEmbed({ lat, lng, label, address, height = 240 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    if (typeof window === 'undefined') return

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    const initMap = () => {
      const L = (window as any).L
      if (!mapRef.current || mapInstance.current) return

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      })

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Custom red pin marker matching WAM design
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 20px; height: 20px;
          background: #E8001C;
          border: 3px solid #1A1A1A;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 2px 2px 0 0 rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -24],
      })

      const popup = `<div style="font-family:'Share Tech Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#1A1A1A;font-weight:700;line-height:1.5;">
        ${label}${address ? `<br/><span style="font-weight:400;color:#6B6560">${address}</span>` : ''}
      </div>`

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(popup, { maxWidth: 220, className: 'wam-popup' })

      // Attribution bottom-right, minimal
      L.control.attribution({ prefix: '© <a href="https://openstreetmap.org">OSM</a>' }).addTo(map)

      mapInstance.current = map
    }

    loadLeaflet()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [lat, lng, label, address])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, border: '2px solid #1A1A1A', background: '#EDE9E2', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <style>{`
        .wam-popup .leaflet-popup-content-wrapper {
          border-radius: 0;
          border: 2px solid #1A1A1A;
          box-shadow: 3px 3px 0 0 #1A1A1A;
          background: #F4F1EC;
          padding: 0;
        }
        .wam-popup .leaflet-popup-content { margin: 10px 14px; }
        .wam-popup .leaflet-popup-tip { background: #F4F1EC; }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          border: 1px solid #1A1A1A !important;
          font-family: 'Share Tech Mono', monospace !important;
          color: #1A1A1A !important;
        }
      `}</style>
    </div>
  )
}
