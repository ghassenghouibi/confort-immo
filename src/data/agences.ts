import type { AgencySlug } from '../lib/listings'

export interface Agency {
  slug: AgencySlug
  name: string
  short: string
  initials: string
  phone: string
  phone2?: string
  whatsapp: string
  address: string
  hours: string
  mapsQuery: string
}

export const AGENCIES: Agency[] = [
  {
    slug: 'charguia',
    name: 'Confort Immo',
    short: 'Charguia',
    initials: 'CI',
    phone: '+216 25 354 558',
    phone2: '+216 21 160 063',
    whatsapp: '21625354558',
    address: "41, rue de l'Industrie, 2035 Charguia 1",
    hours: 'Lun – Sam · 9h – 18h',
    mapsQuery: "Confort Immo, 41 rue de l'Industrie, Charguia 1, Tunis",
  },
]

export const agencyBySlug = (slug: AgencySlug) => AGENCIES.find((a) => a.slug === slug)!

export const CONTACT = {
  phone: '+216 25 354 558',
  email: 'contact@confort.immo',
}
