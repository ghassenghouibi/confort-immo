import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Map as LMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatPrice, type Listing } from '../lib/listings'
import { proximiteFor } from '../lib/proximite'
import './ListingsMap.css'

/** Carte des résultats, centrée sur Tunis (Leaflet + imagerie satellite Esri, sans clé API) */

const TUNIS: [number, number] = [36.8065, 10.1815]
const ZOOM = 11
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services'
const SAT_URL = `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`
const LABELS_URL = `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`

export default function ListingsMap({ listings, height = 560 }: { listings: Listing[]; height?: number }) {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)
  const navigate = useNavigate()
  const ids = listings.map((l) => l.id).join(',')

  useEffect(() => {
    let cancelled = false
    let map: LMap | null = null
    import('leaflet').then(({ default: L }) => {
      if (cancelled || !elRef.current) return
      map = L.map(elRef.current, { center: TUNIS, zoom: ZOOM, scrollWheelZoom: false })
      map.attributionControl.setPrefix(false)
      L.tileLayer(SAT_URL, { maxZoom: 18, attribution: 'Imagery © Esri' }).addTo(map)
      L.tileLayer(LABELS_URL, { maxZoom: 18 }).addTo(map)
      listings.forEach((l, i) => {
        const p = proximiteFor(l)
        if (!p) return
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({ className: 'lm-pin-wrap', html: `<span class="lm-pin${i === 0 ? ' berry' : ''}">${formatPrice(l).main}</span>`, iconSize: [0, 0] }),
          title: l.titre,
        }).on('click', () => navigate(`/bien/${l.id}`)).addTo(map!)
      })
      mapRef.current = map
    })
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, navigate])

  return <div ref={elRef} className="lm" style={{ height }} aria-label="Carte des biens · Tunis" />
}
