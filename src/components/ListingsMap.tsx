import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LatLngBounds, Map as LMap, TileLayer } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatPrice, type Listing } from '../lib/listings'
import { proximiteFor } from '../lib/proximite'
import './SatelliteMap.css'
import './ListingsMap.css'

/**
 * Carte des résultats, centrée sur Tunis (Leaflet + tuiles Esri / OpenStreetMap, sans clé API).
 * Mêmes commandes que la carte de la fiche bien : satellite / plan, zoom, recentrage, plein écran.
 */

const TUNIS: [number, number] = [36.8065, 10.1815]
const ZOOM = 11
const MAX_ZOOM = 18
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services'
const SAT_URL = `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`
const LABELS_URL = `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`
const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

type Mode = 'sat' | 'plan'

export default function ListingsMap({ listings, height = 560 }: { listings: Listing[]; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)
  const layersRef = useRef<Record<Mode, TileLayer[]> | null>(null)
  const boundsRef = useRef<LatLngBounds | null>(null)
  const [mode, setMode] = useState<Mode>('sat')
  const modeRef = useRef(mode)
  modeRef.current = mode
  const [active, setActive] = useState(false)
  const [full, setFull] = useState(false)
  const navigate = useNavigate()
  const ids = listings.map((l) => l.id).join(',')

  const recenter = (animate = true) => {
    const map = mapRef.current
    if (!map) return
    const b = boundsRef.current
    if (b?.isValid()) map.flyToBounds(b, { padding: [48, 48], maxZoom: 14, duration: animate ? 0.6 : 0, animate })
    else map.flyTo(TUNIS, ZOOM, { duration: animate ? 0.6 : 0, animate })
  }

  useEffect(() => {
    let cancelled = false
    let map: LMap | null = null
    import('leaflet').then(({ default: L }) => {
      if (cancelled || !elRef.current) return
      map = L.map(elRef.current, { center: TUNIS, zoom: ZOOM, maxZoom: MAX_ZOOM, zoomControl: false, scrollWheelZoom: false })
      map.attributionControl.setPrefix(false)
      const sat = [
        L.tileLayer(SAT_URL, { maxZoom: MAX_ZOOM, attribution: 'Imagery © Esri' }),
        L.tileLayer(LABELS_URL, { maxZoom: MAX_ZOOM }),
      ]
      const plan = [L.tileLayer(OSM_URL, { maxZoom: MAX_ZOOM, attribution: '© OpenStreetMap' })]
      layersRef.current = { sat, plan }
      layersRef.current[modeRef.current].forEach((t) => t.addTo(map!))
      const points: [number, number][] = []
      listings.forEach((l, i) => {
        const p = proximiteFor(l)
        if (!p) return
        points.push([p.lat, p.lng])
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({ className: 'lm-pin-wrap', html: `<span class="lm-pin${i === 0 ? ' berry' : ''}">${formatPrice(l).main}</span>`, iconSize: [0, 0] }),
          title: l.titre,
        }).on('click', () => navigate(`/bien/${l.id}`)).addTo(map!)
      })
      boundsRef.current = points.length ? L.latLngBounds(points) : null
      mapRef.current = map
      recenter(false)
    })
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      layersRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, navigate])

  // Changement de fond
  useEffect(() => {
    const map = mapRef.current
    const layers = layersRef.current
    if (!map || !layers) return
    const off: Mode = mode === 'sat' ? 'plan' : 'sat'
    layers[off].forEach((t) => map.removeLayer(t))
    layers[mode].forEach((t) => t.addTo(map))
  }, [mode])

  // Zoom à la molette uniquement après un clic, pour ne pas bloquer le défilement de la page
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (active || full) map.scrollWheelZoom.enable()
    else map.scrollWheelZoom.disable()
  }, [active, full])

  useEffect(() => {
    if (!active) return
    const out = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setActive(false) }
    document.addEventListener('pointerdown', out)
    return () => document.removeEventListener('pointerdown', out)
  }, [active])

  // Plein écran (simple bascule CSS, fonctionne aussi sur iOS)
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 50)
    if (!full) return () => clearTimeout(t)
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false) }
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [full])

  return (
    <div
      ref={wrapRef}
      className={`sat lm${full ? ' sat-full' : ''}`}
      style={full ? undefined : { height }}
      onPointerDown={() => setActive(true)}
    >
      <div ref={elRef} className="sat-map" aria-label="Carte des biens · Tunis" />

      <div className="sat-switch" role="radiogroup" aria-label="Fond de carte">
        <button type="button" role="radio" aria-checked={mode === 'sat'} className={mode === 'sat' ? 'on' : ''} onClick={() => setMode('sat')}>Satellite</button>
        <button type="button" role="radio" aria-checked={mode === 'plan'} className={mode === 'plan' ? 'on' : ''} onClick={() => setMode('plan')}>Plan</button>
      </div>

      <div className="sat-tools">
        <button type="button" aria-label="Zoomer" onClick={() => mapRef.current?.zoomIn()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <button type="button" aria-label="Dézoomer" onClick={() => mapRef.current?.zoomOut()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
        <button type="button" aria-label="Recentrer sur les biens" onClick={() => recenter()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="7" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
        </button>
        <button type="button" aria-label={full ? 'Quitter le plein écran' : 'Plein écran'} onClick={() => setFull((f) => !f)}>
          {full ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          )}
        </button>
      </div>

      {!active && !full && <span className="sat-hint">Cliquez pour zoomer avec la molette</span>}
    </div>
  )
}
