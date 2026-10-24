import { Link } from 'react-router-dom'
import Photo from './Photo'
import { ArrowRight, Facebook, Home, Instagram, Phone, Route, TikTok } from './Icons'
import { SOCIAL } from '../data/videos'
import { AGENCIES, type Agency } from '../data/agences'
import { LISTINGS, zoneCount, type Zone, type Rubrique } from '../lib/listings'
import './Blocks.css'

/* ---------- Réseaux sociaux : 4 cartes ---------- */
export function SocialStats({ dark = true }: { dark?: boolean }) {
  const items = [
    { icon: <Instagram size={17} />, name: 'Instagram', ...SOCIAL.instagram },
    { icon: <TikTok size={17} />, name: 'TikTok', ...SOCIAL.tiktok },
    { icon: <Facebook size={17} />, name: 'Facebook', ...SOCIAL.facebook },
  ]
  return (
    <div className="grid grid-3">
      {items.map((s) => (
        <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className={`ss ${dark ? 'card-dark' : 'card'}`}>
          <div className="row" style={{ gap: 8, fontWeight: 600 }}>{s.icon} {s.name}</div>
          <div className="ss-num">{s.followers}</div>
          <div className="ss-handle">{s.handle}</div>
        </a>
      ))}
    </div>
  )
}

/* ---------- Quartier ---------- */
export function ZoneCard({ zone, big = false, rubrique = 'acheter' }: { zone: Zone; big?: boolean; rubrique?: Rubrique }) {
  const n = zoneCount(zone)
  const sample = LISTINGS.filter((l) => zone.delegations.includes(l.delegation) && l.photos.length > 3)
    .sort((a, b) => Number(b.categorie.includes('Villa')) - Number(a.categorie.includes('Villa')) || b.photos.length - a.photos.length)[0]
  return (
    <Link to={`/${rubrique}?zone=${zone.slug}`} className={`zc ${big ? 'zc-big' : ''}`}>
      <Photo src={sample?.photos[0]} alt={zone.name} tone={zone.slug === 'el-aouina' ? 'ph-berry' : ''} className="zc-media">
        <span className="zc-shade" />
        <span className="zc-text">
          <span className="zc-name">{zone.name}</span>
          <span className="zc-count">{n} biens{big && zone.tagline ? ` · ${zone.tagline}` : ''}</span>
        </span>
      </Photo>
    </Link>
  )
}

/* ---------- Agence ---------- */
export function AgencyCard({ agency }: { agency: Agency }) {
  const n = LISTINGS.filter((l) => l.agenceSlug === agency.slug).length
  return (
    <div className="card ac">
      <h3 className="ac-name">{agency.name}</h3>
      <div className="ac-line"><Home size={17} /> {n} biens à vendre et à louer</div>
      <div className="ac-line"><Phone size={17} /> {agency.phone}{agency.phone2 ? ` · ${agency.phone2}` : ''}</div>
      <div className="ac-line small muted" style={{ paddingLeft: 27 }}>{agency.address} · {agency.hours}</div>
      <div className="row ac-actions">
        <a className="btn btn-outline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.mapsQuery)}`} target="_blank" rel="noreferrer">
          <Route size={16} /> Itinéraire
        </a>
        <a className="btn btn-primary" href={`tel:${agency.phone.replace(/\s/g, '')}`}>Appeler</a>
      </div>
    </div>
  )
}

export function AgenciesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <div className="eyebrow">Nous rencontrer</div>
            <h2 className="h-section">Une agence, une équipe à votre écoute</h2>
          </div>
          <Link to="/agences" className="link">Itinéraire et horaires <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-2 reveal reveal-stagger">
          {AGENCIES.map((a) => <AgencyCard key={a.slug} agency={a} />)}
          <MapMock pins={['Charguia 1', 'La Marsa', 'Berges du Lac', 'Gammarth', 'La Soukra']} height={300} />
        </div>
      </div>
    </section>
  )
}

/* ---------- Bandeau CTA dégradé ---------- */
export function CtaBanner({ title, text }: { title: string; text: string }) {
  return (
    <div className="cta">
      <div>
        <h2 className="cta-title">{title}</h2>
        <p className="cta-text">{text}</p>
      </div>
      <div className="row wrap">
        <Link to="/deposer" className="btn btn-white btn-lg">Déposer mon bien</Link>
        <a href={`tel:${AGENCIES[0].phone.replace(/\s/g, '')}`} className="btn btn-outline-white btn-lg">Nous appeler</a>
      </div>
    </div>
  )
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  const items: number[] = []
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) items.push(p)
  return (
    <nav className="pg" aria-label="Pagination">
      <button className="pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Précédent">‹</button>
      {items[0] > 1 && <><button className="pg-btn" onClick={() => onChange(1)}>1</button><span className="pg-dots">…</span></>}
      {items.map((p) => (
        <button key={p} className={`pg-btn ${p === page ? 'on' : ''}`} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
      ))}
      {items[items.length - 1] < pages && <><span className="pg-dots">…</span><button className="pg-btn" onClick={() => onChange(pages)}>{pages}</button></>}
      <button className="pg-btn" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Suivant">›</button>
    </nav>
  )
}

/* ---------- Carte décorative (pas de coordonnées dans les données) ---------- */
export function MapMock({ pins = [], height = 520, single = false }: { pins?: string[]; height?: number; single?: boolean }) {
  const spots = [
    [18, 22], [45, 38], [72, 50], [20, 60], [58, 78], [40, 90],
  ]
  return (
    <div className="mm" style={{ height }}>
      <div className="mm-blob" />
      {single ? (
        <span className="mm-pin-single" />
      ) : (
        pins.slice(0, 6).map((p, i) => (
          <span key={i} className={`mm-pin ${i === 0 ? 'berry' : ''}`} style={{ left: `${spots[i][0]}%`, top: `${spots[i][1]}%` }}>{p}</span>
        ))
      )}
    </div>
  )
}
