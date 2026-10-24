import { useEffect, useRef, useState } from 'react'
import type { Map as LMap, TileLayer } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './SatelliteMap.css'

/**
 * Carte interactive du quartier (Leaflet + tuiles Esri / OpenStreetMap, sans clé API).
 * Volontairement imprécise : pas d'épingle, seulement une zone d'environ
 * RADIUS_M mètres, décalée de façon stable (graine = id du bien) pour ne
 * jamais révéler l'adresse exacte.
 */

const ZOOM = 16
const MIN_ZOOM = 12
const MAX_ZOOM = 18
const RADIUS_M = 350
const JITTER_M = 220

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services'
const SAT_URL = `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`
const LABELS_URL = `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`
const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

type Mode = 'sat' | 'plan'

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Décalage stable de 0 à JITTER_M mètres dans une direction pseudo-aléatoire */
function jitter(lat: number, lng: number, seed: string): [number, number] {
  const h = hash(seed)
  const angle = ((h % 360) * Math.PI) / 180
  const dist = ((h >>> 9) % 1000) / 1000 * JITTER_M
  return [
    lat + (Math.cos(angle) * dist) / 111320,
    lng + (Math.sin(angle) * dist) / (111320 * Math.cos((lat * Math.PI) / 180)),
  ]
}

export default function SatelliteMap({ lat, lng, seed, label, height = 320 }: { lat: number; lng: number; seed: string; label: string; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LMap | null>(null)
  const layersRef = useRef<Record<Mode, TileLayer[]> | null>(null)
  const [mode, setMode] = useState<Mode>('sat')
  const modeRef = useRef(mode)
  modeRef.current = mode
  const [active, setActive] = useState(false)
  const [full, setFull] = useState(false)
  const center = jitter(lat, lng, seed)

  // Création de la carte (Leaflet chargé à la demande pour ne pas alourdir le bundle principal)
  useEffect(() => {
    let cancelled = false
    let map: LMap | null = null
    import('leaflet').then(({ default: L }) => {
      if (cancelled || !elRef.current) return
      map = L.map(elRef.current, {
        center,
        zoom: ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
      })
      map.attributionControl.setPrefix(false)
      const sat = [
        L.tileLayer(SAT_URL, { maxZoom: MAX_ZOOM, attribution: 'Imagery © Esri' }),
        L.tileLayer(LABELS_URL, { maxZoom: MAX_ZOOM }),
      ]
      const plan = [L.tileLayer(OSM_URL, { maxZoom: MAX_ZOOM, attribution: '© OpenStreetMap' })]
      layersRef.current = { sat, plan }
      layersRef.current[modeRef.current].forEach((t) => t.addTo(map!))
      L.circle(center, {
        radius: RADIUS_M,
        color: '#a02957',
        weight: 2,
        dashArray: '6 6',
        fillColor: '#a02957',
        fillOpacity: 0.16,
        interactive: false,
      }).addTo(map)
      mapRef.current = map
    })
    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      layersRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, seed])

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

  const recenter = () => mapRef.current?.flyTo(center, ZOOM, { duration: 0.6 })

  return (
    <div
      ref={wrapRef}
      className={`sat${full ? ' sat-full' : ''}`}
      style={full ? undefined : { height }}
      onPointerDown={() => setActive(true)}
    >
      <div ref={elRef} className="sat-map" aria-label={`Carte du secteur : ${label}`} />

      <span className="sat-label">Secteur approximatif · {label}</span>

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
        <button type="button" aria-label="Recentrer sur le secteur" onClick={recenter}>
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
