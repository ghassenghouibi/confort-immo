import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import PropertyCard from '../components/PropertyCard'
import VideoCard from '../components/VideoCard'
import Photo from '../components/Photo'
import { AgenciesSection, SocialStats, ZoneCard } from '../components/Blocks'
import { ArrowRight, Camera, Facebook, Instagram, Map, Pin, Play, Sparkle, TikTok, Tour, WhatsApp } from '../components/Icons'
import { LISTINGS, TOTAL_PHOTOS, ZONES, formatPrice, shortLocation, zoneCount, type Rubrique } from '../lib/listings'
import { VIDEOS, SOCIAL } from '../data/videos'
import { hasVideo } from '../lib/videos'
import { visiteFor } from '../lib/visites'
import { useCountUp, useRevealAll } from '../hooks/useReveal'
import villa1 from '../assets/hero/villa-1.jpg'
import villa2 from '../assets/hero/villa-2.jpg'
import villa4 from '../assets/hero/villa-4.jpg'
import villa6 from '../assets/hero/villa-6.jpg'
import './Home.css'

/** Diaporama du hero (photos libres de droits, Unsplash) — effet Ken Burns + fondu. */
const SLIDES = [
  { src: villa1, caption: 'Villa contemporaine avec piscine' },
  { src: villa2, caption: 'Architecture blanche, lumière méditerranéenne' },
  { src: villa4, caption: 'Terrasses ouvertes sur le jardin' },
  { src: villa6, caption: 'Vivre dehors, même le soir' },
]
const SLIDE_MS = 6500

const MARQUEE = ['La Marsa', 'Gammarth', 'Berges du Lac', 'La Soukra', 'Chotrana', 'Mutuelleville', 'Jardins de Carthage', 'El Menzah', 'El Aouina', 'Hammamet']

function Stat({ value, label }: { value: number; label: string }) {
  const { ref, n } = useCountUp(value)
  return (
    <div>
      <strong ref={ref as React.RefObject<HTMLElement>}>{n.toLocaleString('fr-FR')}</strong>
      <span>{label}</span>
    </div>
  )
}

const FEATURED_ID = '5867' // Villa à Gammarth Marina (CI5867) — 35 photos

export default function Home() {
  const [tab, setTab] = useState<Rubrique>('acheter')
  const [slide, setSlide] = useState(0)
  const page = useRevealAll<HTMLDivElement>()
  const hero = LISTINGS.find((l) => l.id === FEATURED_ID) ?? LISTINGS[0]
  const heroPrice = formatPrice(hero)

  useEffect(() => {
    const t = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), SLIDE_MS)
    return () => clearInterval(t)
  }, [])

  // Coups de cœur : disponibles, avec beaucoup de photos, vidéo en priorité
  const featured = LISTINGS
    .filter((l) => l.rubriques.includes(tab) && (tab === 'acheter' ? !l.isLocation : tab === 'louer' ? l.isLocation : true) && l.isDisponible && l.photos.length >= 8)
    .sort((a, b) => Number(hasVideo(b)) - Number(hasVideo(a)) || b.photos.length - a.photos.length)
    .slice(0, 4)

  const locations = LISTINGS
    .filter((l) => l.isLocation && l.isDisponible && l.prix)
    .sort((a, b) => Number(hasVideo(b)) - Number(hasVideo(a)) || b.photos.length - a.photos.length)
    .slice(0, 3)

  const nbLocations = LISTINGS.filter((l) => l.isLocation).length
  const zones = ZONES.filter((z) => zoneCount(z) > 0).slice(0, 5)

  return (
    <div ref={page}>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          {SLIDES.map((sl, i) => (
            <div key={sl.src} className={`hero-slide${i === slide ? ' on' : ''}`} style={{ backgroundImage: `url(${sl.src})` }} />
          ))}
          <div className="hero-veil" />
          <div className="hero-grain" />
        </div>

        <div className="container hero-inner">
          <div className="hero-copy">
            <div className="eyebrow hero-anim">Agence immobilière · Tunis</div>
            <h1 className="h-display">
              <span className="hero-line hero-anim">Votre adresse,</span>
              <span className="hero-line hero-anim">de <em>Gammarth</em></span>
              <span className="hero-line hero-anim">au <em>Lac</em>.</span>
            </h1>
            <p className="lead hero-lead hero-anim">
              {LISTINGS.length} villas, appartements et bureaux à vendre et à louer. Un conseiller Confort Immo vous accompagne de la première visite à la signature.
            </p>
            <div className="row wrap hero-actions hero-anim">
              <Link to="/acheter" className="btn btn-berry btn-lg">Explorer les biens <ArrowRight size={18} /></Link>
              <Link to="/deposer" className="btn btn-outline-white btn-lg">Estimer mon bien</Link>
            </div>
            <div className="row hero-social hero-anim">
              <span className="small" style={{ color: '#aab6c8' }}>Suivez-nous</span>
              <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
              <a href={SOCIAL.tiktok.url} target="_blank" rel="noreferrer" aria-label="TikTok"><TikTok size={17} /></a>
              <a href={SOCIAL.facebook.url} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17} /></a>
            </div>
          </div>

          <Link to={`/bien/${hero.id}`} className="hero-feature hide-mobile hero-anim">
            <Photo src={hero.photos[0]} alt={hero.titre} tone="ph-dark" className="hero-feature-media">
              <span className="hero-photos"><Camera size={13} /> {hero.photos.length} photos</span>
              <span className="hero-media-tags">
                {hasVideo(hero) && <span><Play size={12} /> Vidéo</span>}
                {visiteFor(hero) && <span><Tour size={12} /> Visite 360°</span>}
              </span>
            </Photo>
            <div className="hero-feature-body">
              <div className="row" style={{ gap: 8 }}>
                <span className="badge badge-location">Coup de cœur</span>
                <span className="small" style={{ color: 'var(--muted-2)', letterSpacing: '.1em', fontWeight: 600 }}>{hero.reference.toUpperCase()}</span>
              </div>
              <div className="h-card mt-8">{hero.titre}</div>
              <div className="row small muted mt-8" style={{ gap: 6 }}><Pin size={14} /> {shortLocation(hero)}</div>
              <div className="row between mt-8">
                <span className="hero-price">{heroPrice.main}</span>
                {hero.surface_m2 ? <span className="small muted">{hero.surface_m2} m²</span> : null}
              </div>
              <span className="hero-feature-cta">Découvrir le bien <ArrowRight size={15} /></span>
            </div>
          </Link>
        </div>

        <div className="container hero-bottom hero-anim">
          <div className="hero-dots" role="tablist" aria-label="Diaporama">
            {SLIDES.map((sl, i) => (
              <button key={sl.src} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={sl.caption} role="tab" aria-selected={i === slide} />
            ))}
            <span className="hero-caption">{SLIDES[slide].caption}</span>
          </div>
          <a href="#recherche" className="hero-scroll" aria-label="Défiler"><span /></a>
        </div>

        <div className="container hero-search" id="recherche">
          <SearchBar />
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="container stats-wrap">
        <div className="stats card reveal">
          <Stat value={LISTINGS.length} label="biens en ligne aujourd'hui" />
          <Stat value={TOTAL_PHOTOS} label="photos HD publiées" />
          <Stat value={ZONES.filter((z) => zoneCount(z) > 0).length} label="secteurs, de Gammarth à Hammamet" />
          <Stat value={nbLocations} label="biens à la location" />
        </div>
      </section>

      {/* ---------- BANDEAU DÉFILANT ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((z, i) => <span key={i}>{z}<i /></span>)}
        </div>
      </div>

      {/* ---------- COUPS DE CŒUR ---------- */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Sélection de la semaine</div>
              <h2 className="h-section">
                Nos coups de cœur {tab === 'acheter' ? 'à la vente' : tab === 'louer' ? 'à la location' : 'en bureaux'}
              </h2>
            </div>
            <div className="seg">
              {([['acheter', 'Vente'], ['louer', 'Location'], ['bureaux-et-commerces', 'Bureaux']] as [Rubrique, string][]).map(([k, label]) => (
                <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-4 reveal reveal-stagger">
            {featured.map((l) => <PropertyCard key={l.id} listing={l} />)}
          </div>
        </div>
      </section>

      {/* ---------- LOCATIONS ---------- */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Disponible tout de suite</div>
              <h2 className="h-section">Locations du moment</h2>
            </div>
            <Link to="/louer" className="link">Voir les {nbLocations} locations <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-3 reveal reveal-stagger">
            {locations.map((l) => <PropertyCard key={l.id} listing={l} />)}
          </div>
        </div>
      </section>

      {/* ---------- QUARTIERS ---------- */}
      <section className="section" style={{ background: '#fff', borderBlock: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Explorer</div>
              <h2 className="h-section">Les quartiers où nous sommes forts</h2>
            </div>
            <Link to="/acheter" className="link">Voir la carte <Map size={17} /></Link>
          </div>
          <div className="zones reveal reveal-stagger">
            {zones.map((z, i) => <ZoneCard key={z.slug} zone={z} big={i === 0} />)}
          </div>
        </div>
      </section>

      {/* ---------- VIDÉO / INSTAGRAM ---------- */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-head reveal">
            <div style={{ maxWidth: 680 }}>
              <div className="eyebrow">Confort Immo sur les réseaux</div>
              <h2 className="h-section">Nos nouveautés,<br />d'abord sur Instagram.</h2>
              <p className="lead mt-16">
                Nouveaux biens, visites en vidéo et coups de cœur de la semaine : suivez Confort Immo sur Instagram, TikTok et Facebook, et écrivez-nous directement en message.
              </p>
            </div>
            <div className="row wrap">
              <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" className="btn btn-berry"><Instagram size={17} /> Suivre sur Instagram</a>
              <a href={SOCIAL.tiktok.url} target="_blank" rel="noreferrer" className="btn btn-ghost-dark"><TikTok size={17} /> Voir sur TikTok</a>
            </div>
          </div>
          {VIDEOS.length > 0 && (
            <div className="grid grid-4 reveal reveal-stagger">
              {VIDEOS.slice(0, 4).map((v) => <VideoCard key={v.url} video={v} />)}
            </div>
          )}
          <div className="mt-32 reveal">
            <SocialStats />
          </div>
          <div className="row wrap mt-24 reveal">
            <span className="chip chip-dark"><Camera size={16} /> Photos de chaque bien</span>
            <span className="chip chip-dark"><WhatsApp size={16} /> Réponse par DM ou WhatsApp</span>
            <span className="chip chip-dark"><Play size={16} /> Visites sur rendez-vous</span>
            <span className="chip chip-dark"><Sparkle size={16} /> Les nouveautés en story</span>
          </div>
          <div className="mt-24">
            <Link to="/videos" className="link" style={{ color: 'var(--berry-light)' }}>Nos réseaux sociaux <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <AgenciesSection />
    </div>
  )
}
