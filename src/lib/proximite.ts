import raw from '../data/proximite.json'
import type { Listing } from './listings'

export type ProxCategory = 'commerces' | 'ecoles' | 'sante' | 'transports' | 'loisirs'

export interface Place {
  name: string
  /** Type lisible : Supermarché, Pharmacie, École… */
  kind: string
  /** Distance à vol d'oiseau en mètres */
  m: number
}

interface Entry {
  lat: number
  lng: number
  /** Faux si la localité n'a pas été trouvée et qu'on a pris le centre de la délégation */
  precise: boolean
  places: Partial<Record<ProxCategory, Place[]>>
}

const DATA = raw as Record<string, Entry>

export const PROX_LABEL: Record<ProxCategory, string> = {
  commerces: 'Commerces',
  ecoles: 'Écoles',
  sante: 'Santé',
  transports: 'Transports',
  loisirs: 'Loisirs & restauration',
}

/** Lieux autour du bien (générés depuis OpenStreetMap par scripts/build-proximite.py) */
export const proximiteFor = (l: Listing): Entry | undefined => DATA[`${l.localite}|${l.delegation}`]

/** "350 m · 4 min à pied" / "1,2 km · 15 min à pied" */
export function formatDistance(m: number): string {
  const d = m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`
  return `${d} · ${Math.max(1, Math.round(m / 80))} min à pied`
}
