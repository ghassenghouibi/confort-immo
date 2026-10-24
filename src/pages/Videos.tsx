import { useEffect, useState } from 'react'
import VideoCard from '../components/VideoCard'
import Photo from '../components/Photo'
import { CtaBanner, SocialStats } from '../components/Blocks'
import { EmbedFrame } from '../components/VideoPlayer'
import { ArrowRight, Grid, Home, Instagram, Map, Play, PlayFilled, Sparkle, TikTok, X } from '../components/Icons'
import { INSTAGRAM_POSTS, SOCIAL, VIDEOS, type PostItem } from '../data/videos'
import { listingOf } from '../lib/videos'
import { parseEmbed } from '../lib/embed'
import './Videos.css'

const FORMATS = [
  { icon: <Play size={18} />, cls: 'berry', title: 'La visite', text: "Un reel vertical de 60 secondes, pièce par pièce, avec la surface et le prix affichés à l'écran." },
  { icon: <Map size={18} />, cls: 'steel', title: 'Le quartier', text: "Écoles, commerces, temps de trajet, prix au m² : ce qu'il faut savoir avant de choisir La Soukra ou Gammarth." },
  { icon: <Home size={18} />, cls: 'blue', title: 'Les coulisses', text: "Avancement des chantiers et programmes neufs, filmés à chaque étape jusqu'à la livraison." },
  { icon: <Sparkle size={18} />, cls: 'grey', title: 'Le bien du jour', text: 'Une story quotidienne sur la nouveauté du portefeuille, avec le lien direct vers la fiche.' },
]

const WHY = [
  { n: '01', title: 'Moins de visites pour rien', text: 'Vous savez à quoi ressemble le bien, son vis-à-vis et son quartier avant de prendre la route. Les visites servent à décider, pas à découvrir.' },
  { n: '02', title: "Vos annonces vues de l'étranger", text: 'Une grande partie des acheteurs de Gammarth et de La Marsa vivent hors de Tunisie. La vidéo est le seul format qui les fait décider à distance.' },
  { n: '03', title: 'On vous répond où vous êtes', text: "DM Instagram, TikTok, WhatsApp ou téléphone : la demande arrive directement au conseiller qui gère le bien, avec sa référence." },
]

function PostTile({ post, onOpen }: { post: PostItem; onOpen: () => void }) {
  const e = parseEmbed(post.url)
  const tones: ('' | 'ph-steel' | 'ph-berry')[] = ['', 'ph-steel', 'ph-berry', '']
  const idx = INSTAGRAM_POSTS.indexOf(post)
  return (
    <button className="pt" onClick={onOpen} aria-label={post.label ?? 'Post Instagram'}>
      <Photo src={post.cover} tone={tones[idx % 4]} className="pt-media">
        <span className="pt-icon">{e.src.includes('/reel/') ? <PlayFilled size={16} /> : <Grid size={16} />}</span>
        <span className="pt-shade" />
        {post.label && <span className="pt-label">{post.label}</span>}
      </Photo>
    </button>
  )
}

export default function Videos() {
  const [post, setPost] = useState<PostItem | null>(null)
  const phones = VIDEOS.slice(0, 2)

  useEffect(() => {
    if (!post) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPost(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [post])

  return (
    <>
      {/* ---------- Hero studio ---------- */}
      <section className="vh section-dark">
        <div className="container vh-grid">
          <div>
            <div className="eyebrow">Confort Immo · Réseaux sociaux</div>
            <h1 className="h-display">On filme.<br />Vous visitez<br /><span className="berry">avant tout le monde.</span></h1>
            <p className="lead mt-24" style={{ maxWidth: 560 }}>
              Chaque bien de notre portefeuille passe devant la caméra : visite guidée, plan du quartier, coulisses de chantier. Le tout publié sur Instagram et TikTok, souvent avant même l'annonce complète.
            </p>
            <div className="row wrap mt-32">
              <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" className="btn btn-berry btn-lg"><Instagram size={17} /> {SOCIAL.instagram.handle}</a>
              <a href={SOCIAL.tiktok.url} target="_blank" rel="noreferrer" className="btn btn-ghost-dark btn-lg"><TikTok size={17} /> {SOCIAL.tiktok.handle}</a>
            </div>
          </div>
          {phones.length > 0 && <div className="vh-phones hide-mobile">
            {phones.map((v, i) => {
              const l = listingOf(v)
              return (
                <div key={v.url} className={`phone phone-${i + 1}`}>
                  <VideoCard video={{ ...v, title: l ? `${l.kicker[0]}${l.kicker.slice(1).toLowerCase()} · ${l.localite}` : v.title, subtitle: v.ref }} size="sm" />
                </div>
              )
            })}
          </div>}
        </div>
        <div className="container mt-48">
          <SocialStats />
        </div>
      </section>

      {/* ---------- Les visites du moment ---------- */}
      {VIDEOS.length > 0 && <section className="section section-dark" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">À la une cette semaine</div>
              <h2 className="h-section">Les visites du moment</h2>
            </div>
            <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" className="btn btn-ghost-dark">Tout voir <ArrowRight size={16} /></a>
          </div>
          <div className="grid grid-5">
            {VIDEOS.slice(0, 5).map((v) => <VideoCard key={v.url} video={v} size="sm" />)}
          </div>
          {VIDEOS.length > 5 && (
            <div className="grid grid-5 mt-24">
              {VIDEOS.slice(5).map((v) => <VideoCard key={v.url} video={v} size="sm" />)}
            </div>
          )}
        </div>
      </section>}

      {/* ---------- Formats ---------- */}
      <section className="section section-dark" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="eyebrow">Nos formats</div>
          <h2 className="h-section mb-24">Quatre rendez-vous par semaine</h2>
          <div className="grid grid-4">
            {FORMATS.map((f) => (
              <div key={f.title} className="card-dark fmt">
                <span className={`fmt-icon ${f.cls}`}>{f.icon}</span>
                <h3 className="fmt-title">{f.title}</h3>
                <p className="small" style={{ color: '#aab6c8', lineHeight: 1.6 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Feed Instagram ---------- */}
      {INSTAGRAM_POSTS.length > 0 && <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Le feed</div>
              <h2 className="h-section">Les derniers posts</h2>
            </div>
            <a href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" className="btn btn-outline"><Instagram size={16} /> Ouvrir Instagram <ArrowRight size={16} /></a>
          </div>
          <div className="grid grid-4">
            {INSTAGRAM_POSTS.map((p) => <PostTile key={p.url} post={p} onOpen={() => setPost(p)} />)}
          </div>
        </div>
      </section>}

      {/* ---------- Pourquoi ---------- */}
      <section className="section" style={INSTAGRAM_POSTS.length > 0 ? { paddingTop: 0 } : undefined}>
        <div className="container">
          <div className="eyebrow">Pourquoi ça compte</div>
          <h2 className="h-section mb-24">Ce que la vidéo change</h2>
          <div className="grid grid-3">
            {WHY.map((w) => (
              <div key={w.n} className="card why">
                <div className="why-n">{w.n}</div>
                <h3 className="h-card mt-16">{w.title}</h3>
                <p className="muted mt-16" style={{ lineHeight: 1.65 }}>{w.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-48">
            <CtaBanner title="Votre bien mérite sa vidéo." text="Confiez-nous la vente ou la location : reportage photo, visite filmée et diffusion sur Instagram, TikTok et Facebook, inclus dans le mandat." />
          </div>
        </div>
      </section>

      {post && (
        <div className="vm-backdrop" onClick={() => setPost(null)} role="dialog" aria-modal="true">
          <div className="vm vm-vertical" onClick={(e) => e.stopPropagation()}>
            <button className="vm-close" onClick={() => setPost(null)} aria-label="Fermer"><X size={20} /></button>
            <div className="vm-player"><EmbedFrame url={post.url} title={post.label ?? 'Post'} /></div>
            <div className="vm-info">
              <div className="small muted">Instagram</div>
              <h3 className="h-card mt-8">{post.label ?? 'Post Instagram'}</h3>
              {!parseEmbed(post.url).placeholder && (
                <a href={post.url} target="_blank" rel="noreferrer" className="link small mt-16" style={{ display: 'inline-flex' }}>Ouvrir sur Instagram</a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
