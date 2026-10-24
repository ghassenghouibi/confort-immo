import raw from '../data/annonces.json'

export type Rubrique = 'acheter' | 'louer' | 'bureaux-et-commerces'

export interface RawAnnonce {
  id: string
  reference: string
  titre: string
  transaction: 'Vente' | 'Location'
  disponibilite: string
  type_bien: string
  prix: number | null
  devise: string
  prix_texte: string
  surface_habitable_m2: number | null
  surface_terrain_m2: number | null
  surface_m2: number | null
  chambres: number | null
  suites: number | null
  sdb: number | null
  pays: string
  gouvernorat: string
  delegation: string
  localite: string
  adresse_complete: string
  description: string
  agence: string
  telephones: string[]
  rubriques: Rubrique[]
  photos: string[]
  nb_photos: number
  url: string
  autres_champs: Record<string, string>
  statut_annonce: string | null
  date_publication: string
}

export interface Listing extends RawAnnonce {
  /** Catégorie principale : Appartement, Maison / Villa, Terrain, Bureau et local, Immeuble */
  categorie: string
  /** Sous-type (Duplex, Villa, Local commercial...) ou catégorie si absent */
  sousType: string
  /** Libellé court en capitales pour la carte : VILLA, DUPLEX, APPARTEMENT... */
  kicker: string
  /** Slug d'agence (Confort Immo n'a qu'une agence, à la Charguia) */
  agenceSlug: AgencySlug
  /** Prestations détectées dans la description */
  features: string[]
  isLocation: boolean
  isDisponible: boolean
  isNeuf: boolean
  isMeuble: boolean
}

export type AgencySlug = 'charguia'

const FEATURE_RULES: [RegExp, string][] = [
  [/piscine/i, 'Piscine'],
  [/vue (sur )?mer/i, 'Vue mer'],
  [/meubl/i, 'Meublé'],
  [/balcon/i, 'Balcon'],
  [/terrasse/i, 'Terrasse'],
  [/jardin/i, 'Jardin'],
  [/garage/i, 'Garage'],
  [/parking/i, 'Parking'],
  [/ascenseur/i, 'Ascenseur'],
  [/climatis|clim\b/i, 'Climatisation'],
  [/chauffage central/i, 'Chauffage central'],
  [/titre foncier|titre bleu/i, 'Titre foncier'],
  [/sur plan|promoteur|neuf/i, 'Neuf / sur plan'],
  [/cuisine (équipée|equipée|équipé)/i, 'Cuisine équipée'],
  [/dressing/i, 'Dressing'],
  [/gardien|sécurité|securit/i, 'Gardiennage'],
]

function kickerFor(categorie: string, sousType: string): string {
  const s = sousType.toLowerCase()
  if (s.includes('duplex')) return 'DUPLEX'
  if (s.includes('triplex')) return 'TRIPLEX'
  if (s.includes('rdc')) return 'RDC DE VILLA'
  if (s.includes('étage')) return 'ÉTAGE DE VILLA'
  if (s.includes('local')) return 'LOCAL'
  if (s.includes('bureau')) return 'BUREAU'
  const c = categorie.toLowerCase()
  if (c.includes('villa')) return 'VILLA'
  if (c.includes('terrain')) return 'TERRAIN'
  if (c.includes('immeuble')) return 'IMMEUBLE'
  if (c.includes('bureau')) return 'BUREAU'
  return 'APPARTEMENT'
}

const PLACES = [
  'Les Berges du Lac', 'Berges du Lac', 'Jardins de la Soukra', 'Mutuelleville', 'Mutuelle Ville', 'Hammamet', 'Kelibia', 'Sidi Daoud',
  'Centre Urbain Nord', 'Utique', 'Hannibal', 'Zephyr', 'Wahat', 'RDC', 'Gammarth', 'La Soukra', 'Soukra', 'Chotrana', 'La Marsa', 'Marsa', 'Ariana', 'El Menzah', 'Menzah', 'Ennasr', 'El Aouina', 'Aouina',
  'Carthage', 'El Kram', 'Kram', 'Sidi Bou Said', 'Sidi Bousaid', 'Raoued', 'Mnihla', 'Tunis', 'Lac', 'Golden Tulip', 'Mutuelle Ville',
  'Ain Zaghouan', 'Berges du Lac', 'Jardins de Carthage', 'Riadh', 'Ghazala', 'Boumhel', 'Manar', 'Manzah', 'Nasr', 'Cité', 'Mégrine',
]

/** Nettoie les titres bruts du site : "a louer un appartement s+3 à gammarth" → "Appartement S+3 à Gammarth" */
export function cleanTitle(t: string): string {
  let s = t.trim().replace(/\s+/g, ' ')
  s = s.replace(/^(a|à)\s+(louer|vendre)\s*[:\-–]?\s*/i, '')
  s = s.replace(/^(un|une|des|de)\s+/i, '')
  s = s.replace(/\bs\s*\+\s*(\d)/gi, 'S+$1')
  s = s.replace(/\bh\s*\+\s*(\d)/gi, 'H+$1')
  s = s.replace(/\bs(\d)\b/gi, 'S+$1')
  s = s.replace(/(\d)\s?m2\b/gi, '$1 m²')
  s = s.replace(/\ba la\b/g, 'à la').replace(/\ba el\b/g, 'à El')
  for (const p of PLACES) s = s.replace(new RegExp(`\\b${p}\\b`, 'gi'), p)
  s = s.replace(/\b(duplex|triplex|villa|appartement|studio|immeuble|maison)\b/gi, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase())
  s = s.replace(/ a (?=[A-Z])/g, ' à ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function normalize(a: RawAnnonce): Listing {
  const [categorie, sub] = a.type_bien.split('|').map((s) => s.trim())
  const sousType = sub || categorie
  const text = `${a.titre} ${a.description}`
  const features = FEATURE_RULES.filter(([re]) => re.test(text)).map(([, label]) => label)
  return {
    ...a,
    titre: cleanTitle(a.titre),
    categorie,
    sousType,
    kicker: kickerFor(categorie, sousType),
    agenceSlug: 'charguia',
    features,
    isLocation: a.transaction === 'Location',
    isDisponible: a.disponibilite === 'disponible' || a.disponibilite === 'inconnu',
    isNeuf: /sur plan|promoteur/i.test(text),
    isMeuble: /meubl/i.test(text),
  }
}

const data = raw as unknown as { source: string; date_extraction: string; nb_annonces: number; annonces: RawAnnonce[] }

export const LISTINGS: Listing[] = data.annonces.map(normalize)
export const EXTRACTION_DATE = data.date_extraction
export const TOTAL_PHOTOS = LISTINGS.reduce((n, l) => n + l.photos.length, 0)

export const byId = (id: string) => LISTINGS.find((l) => l.id === id)
export const byRef = (ref: string) =>
  LISTINGS.find((l) => l.reference.toLowerCase() === ref.toLowerCase())

/* ---------- Formatting ---------- */

export function formatPrice(l: Pick<Listing, 'prix' | 'isLocation'>): { main: string; suffix?: string } {
  if (!l.prix) return { main: 'Prix sur demande' }
  const main = `${l.prix.toLocaleString('fr-FR').replace(/ | /g, ' ')} DT`
  return l.isLocation ? { main, suffix: '/ mois' } : { main }
}

export function pricePerM2(l: Listing): string | null {
  const s = l.surface_habitable_m2 || l.surface_m2
  if (!l.prix || !s || l.isLocation) return null
  return `≈ ${Math.round(l.prix / s).toLocaleString('fr-FR')} DT / m² habitable`
}

export function shortLocation(l: Listing): string {
  if (l.localite === 'Emplacement non disponible') return l.gouvernorat
  if (l.localite === l.delegation || l.localite.startsWith(l.delegation)) return `${l.localite}, ${l.gouvernorat}`
  return `${l.localite}, ${l.delegation}`
}

/* ---------- Zones (quartiers) ---------- */

export interface Zone {
  slug: string
  name: string
  /** Délégations regroupées dans cette zone */
  delegations: string[]
  tagline?: string
}

export const ZONES: Zone[] = [
  { slug: 'la-marsa', name: 'La Marsa & Gammarth', delegations: ['La Marsa'], tagline: 'villas, vue mer, appartements meublés' },
  { slug: 'berges-du-lac', name: 'Les Berges du Lac', delegations: ['Les Berges du Lac'], tagline: 'appartements, penthouses, bureaux' },
  { slug: 'la-soukra', name: 'La Soukra & Chotrana', delegations: ['La Soukra'] },
  { slug: 'carthage', name: 'Carthage & Jardins de Carthage', delegations: ['Carthage'] },
  { slug: 'mutuelleville', name: 'Mutuelleville & El Menzah', delegations: ['Mutuelleville', 'El Menzah'] },
  { slug: 'el-aouina', name: 'El Aouina & Ain Zaghouan', delegations: ['El Aouina', 'Centre Urbain Nord'] },
  { slug: 'cap-bon', name: 'Hammamet & Cap Bon', delegations: ['Hammamet', 'Kelibia'] },
  { slug: 'nord', name: 'Bizerte & Utique', delegations: ['Utique'] },
]

export const zoneBySlug = (slug: string) => ZONES.find((z) => z.slug === slug)
export const zoneOf = (l: Listing) => ZONES.find((z) => z.delegations.includes(l.delegation))
export const zoneCount = (z: Zone) => LISTINGS.filter((l) => z.delegations.includes(l.delegation)).length

/* ---------- Filtering ---------- */

export interface Filters {
  rubrique: Rubrique
  zone?: string
  type?: string
  budgetMax?: number
  pieces?: number
  surfaceMin?: number
  video?: boolean
  sort?: 'recent' | 'price-asc' | 'price-desc' | 'surface-desc'
  q?: string
}

export const CATEGORIES = ['Appartement', 'Maison / Villa', 'Terrain', 'Bureau et local...', 'Immeuble']
export const CATEGORY_LABEL: Record<string, string> = {
  'Appartement': 'Appartement',
  'Maison / Villa': 'Maison / Villa',
  'Terrain': 'Terrain',
  'Bureau et local...': 'Bureau & local',
  'Immeuble': 'Immeuble',
}

export function applyFilters(all: Listing[], f: Filters, videoRefs: Set<string> = new Set()): Listing[] {
  let out = all.filter((l) => l.rubriques.includes(f.rubrique))
  // cohérence rubrique / transaction : "acheter" n'affiche que des ventes, "louer" que des locations
  if (f.rubrique === 'acheter') out = out.filter((l) => !l.isLocation)
  if (f.rubrique === 'louer') out = out.filter((l) => l.isLocation)
  if (f.zone) {
    const z = zoneBySlug(f.zone)
    if (z) out = out.filter((l) => z.delegations.includes(l.delegation))
  }
  if (f.type) out = out.filter((l) => l.categorie === f.type)
  if (f.budgetMax) out = out.filter((l) => !l.prix || l.prix <= f.budgetMax!)
  if (f.pieces) out = out.filter((l) => (l.chambres ?? 0) >= f.pieces!)
  if (f.surfaceMin) out = out.filter((l) => (l.surface_habitable_m2 ?? l.surface_m2 ?? 0) >= f.surfaceMin!)
  if (f.video) out = out.filter((l) => videoRefs.has(l.reference.toLowerCase()))
  if (f.q) {
    const q = f.q.toLowerCase()
    out = out.filter((l) => `${l.titre} ${l.reference} ${l.adresse_complete}`.toLowerCase().includes(q))
  }
  // disponibles d'abord
  out = [...out].sort((a, b) => Number(b.isDisponible) - Number(a.isDisponible))
  switch (f.sort) {
    case 'price-asc':
      out.sort((a, b) => (a.prix || Infinity) - (b.prix || Infinity))
      break
    case 'price-desc':
      out.sort((a, b) => (b.prix || 0) - (a.prix || 0))
      break
    case 'surface-desc':
      out.sort((a, b) => (b.surface_m2 || 0) - (a.surface_m2 || 0))
      break
    default:
      out.sort((a, b) => Number(b.isDisponible) - Number(a.isDisponible) || b.date_publication.localeCompare(a.date_publication))
  }
  return out
}

export const RUBRIQUE_LABEL: Record<Rubrique, string> = {
  acheter: 'Acheter',
  louer: 'Louer',
  'bureaux-et-commerces': 'Bureaux & commerces',
}

export const RUBRIQUE_TITLE: Record<Rubrique, string> = {
  acheter: 'Biens à vendre',
  louer: 'Locations',
  'bureaux-et-commerces': 'Bureaux & commerces',
}

export const BUDGETS_VENTE = [300000, 500000, 800000, 1200000, 2000000, 3000000]
export const BUDGETS_LOCATION = [1000, 1500, 2000, 3000, 5000, 8000]

export function similar(l: Listing, n = 4): Listing[] {
  return LISTINGS.filter(
    (o) => o.id !== l.id && o.delegation === l.delegation && o.isDisponible,
  )
    .sort((a, b) => Number(b.transaction === l.transaction) - Number(a.transaction === l.transaction))
    .slice(0, n)
}
