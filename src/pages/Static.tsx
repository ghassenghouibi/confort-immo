import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AgencyCard, CtaBanner, MapMock } from '../components/Blocks'
import { Camera, Check, Clock, Mail, Phone, Play, Sparkle, WhatsApp } from '../components/Icons'
import { AGENCIES, CONTACT } from '../data/agences'
import { LISTINGS, ZONES, zoneCount } from '../lib/listings'
import './Static.css'

function useTop() { useEffect(() => { window.scrollTo({ top: 0 }) }, []) }

/* ---------- Nos agences ---------- */
export function Agences() {
  useTop()
  return (
    <>
      <section className="section" style={{ paddingBottom: 40 }}>
        <div className="container">
          <div className="eyebrow">Nous rencontrer</div>
          <h1 className="h-section">L'agence Confort Immo</h1>
          <p className="lead mt-16" style={{ maxWidth: 640 }}>
            Depuis notre agence de la Charguia, nous accompagnons acheteurs, locataires et propriétaires de La Marsa aux Berges du Lac, de La Soukra à Hammamet. {LISTINGS.length} biens à vendre et à louer, suivis par une seule équipe.
          </p>
          <div className="grid grid-2 mt-32">
            {AGENCIES.map((a) => <AgencyCard key={a.slug} agency={a} />)}
            <div className="card ac">
              <h3 className="ac-name">Contact direct</h3>
              <ul className="st-contacts mt-16">
                <li><Mail size={18} /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li><WhatsApp size={18} /><a href={`https://wa.me/${AGENCIES[0].whatsapp}`} target="_blank" rel="noreferrer">WhatsApp {AGENCIES[0].phone}</a></li>
                <li><Clock size={18} /><span>Lundi – Samedi · 9h – 18h · visites sur rendez-vous</span></li>
              </ul>
              <div className="row ac-actions">
                <Link className="btn btn-berry" to="/contact">Nous écrire</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container st-two">
          <MapMock pins={['Charguia 1', 'La Marsa', 'Berges du Lac', 'Gammarth', 'La Soukra', 'Hammamet']} height={420} />
          <div>
            <h2 className="pp-h2" style={{ fontSize: 26 }}>Secteurs couverts</h2>
            <ul className="st-zones">
              {ZONES.filter((z) => zoneCount(z) > 0).map((z) => (
                <li key={z.slug}><Link to={`/acheter?zone=${z.slug}`}>{z.name}</Link><span className="muted">{zoneCount(z)} biens</span></li>
              ))}
            </ul>
            <div className="row small muted mt-24" style={{ gap: 8 }}><Clock size={15} /> Lundi – Samedi · 9h – 18h · Visites sur rendez-vous</div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------- Contact ---------- */
export function Contact() {
  useTop()
  const [sent, setSent] = useState(false)
  return (
    <section className="section">
      <div className="container st-two">
        <div>
          <div className="eyebrow">Contact</div>
          <h1 className="h-section">Parlons de votre projet</h1>
          <p className="lead mt-16">Achat, location, estimation ou simple question sur un quartier : une réponse pendant les horaires d'agence, par téléphone, e-mail ou WhatsApp.</p>
          <ul className="st-contacts mt-32">
            <li><Phone size={18} /><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a></li>
            {AGENCIES[0].phone2 && <li><Phone size={18} /><a href={`tel:${AGENCIES[0].phone2.replace(/\s/g, '')}`}>{AGENCIES[0].phone2}</a></li>}
            <li><Mail size={18} /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li><WhatsApp size={18} /><a href={`https://wa.me/${AGENCIES[0].whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></li>
          </ul>
          <div className="mt-32 grid" style={{ gap: 10 }}>
            {AGENCIES.map((a) => (
              <div key={a.slug} className="row between small" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <strong>{a.name}</strong><span className="muted">{a.address}</span>
              </div>
            ))}
          </div>
        </div>
        <form className="card st-form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
          {sent ? (
            <div className="st-sent"><Check size={28} /><h3 className="h-card">Message envoyé</h3><p className="muted">Nous revenons vers vous pendant les horaires d'agence.</p></div>
          ) : (
            <>
              <h3 className="h-card">Envoyer un message</h3>
              <div className="grid grid-2" style={{ gap: 10 }}>
                <input className="input" placeholder="Nom et prénom" required />
                <input className="input" type="tel" placeholder="Téléphone" required />
              </div>
              <input className="input" type="email" placeholder="E-mail" />
              <select className="input select" defaultValue="">
                <option value="" disabled>Objet</option>
                <option>Je cherche à acheter</option>
                <option>Je cherche à louer</option>
                <option>Je veux vendre ou louer mon bien</option>
                <option>Autre</option>
              </select>
              <textarea className="input" placeholder="Votre message" required />
              <button className="btn btn-primary btn-block btn-lg">Envoyer</button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}

/* ---------- Déposer / estimer mon bien ---------- */
export function Deposer() {
  useTop()
  const [sent, setSent] = useState(false)
  return (
    <>
      <section className="section">
        <div className="container st-two">
          <div>
            <div className="eyebrow">Vendre ou louer</div>
            <h1 className="h-section">Déposez votre bien, on s'occupe du reste</h1>
            <p className="lead mt-16">Estimation gratuite sous 48 h, reportage photo HD et diffusion sur notre site et nos réseaux — inclus dans le mandat.</p>
            <ul className="st-steps mt-32">
              <li><span className="st-step-n">1</span><div><strong>Vous décrivez le bien</strong><p className="muted small">Adresse, surface, état : deux minutes suffisent.</p></div></li>
              <li><span className="st-step-n">2</span><div><strong>On vient l'estimer</strong><p className="muted small">Un conseiller Confort Immo vous rappelle et fixe un rendez-vous.</p></div></li>
              <li><span className="st-step-n">3</span><div><strong>On photographie, on diffuse</strong><p className="muted small">Photos, reel Instagram / TikTok, annonce sur confort.immo et alertes aux acheteurs du secteur.</p></div></li>
            </ul>
            <div className="row wrap mt-32">
              <span className="chip"><Camera size={15} /> Photos HD incluses</span>
              <span className="chip"><Play size={15} /> Reel offert</span>
              <span className="chip"><Sparkle size={15} /> Estimation gratuite</span>
            </div>
          </div>
          <form className="card st-form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
            {sent ? (
              <div className="st-sent"><Check size={28} /><h3 className="h-card">Demande reçue</h3><p className="muted">Un conseiller vous rappelle sous 48 h pour l'estimation.</p></div>
            ) : (
              <>
                <h3 className="h-card">Estimer mon bien</h3>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <select className="input select" defaultValue="Vente"><option>Vente</option><option>Location</option></select>
                  <select className="input select" defaultValue="Appartement"><option>Appartement</option><option>Maison / Villa</option><option>Terrain</option><option>Bureau / local</option><option>Immeuble</option></select>
                </div>
                <input className="input" placeholder="Adresse ou quartier (ex. Chotrana 2, La Soukra)" required />
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <input className="input" type="number" placeholder="Surface (m²)" />
                  <input className="input" type="number" placeholder="Nombre de pièces" />
                </div>
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <input className="input" placeholder="Nom et prénom" required />
                  <input className="input" type="tel" placeholder="Téléphone" required />
                </div>
                <textarea className="input" placeholder="Précisions (état, étage, équipements...)" />
                <button className="btn btn-primary btn-block btn-lg">Demander une estimation</button>
                <div className="row small muted" style={{ gap: 6 }}><Clock size={14} /> Réponse sous 48 h pendant les horaires d'agence</div>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  )
}

/* ---------- Conseils ---------- */
const ARTICLES = [
  { tag: 'Acheter', title: 'Titre foncier, titre bleu, sur plan : ce qu\'il faut vérifier avant de signer', text: 'Les trois situations juridiques les plus fréquentes dans le Grand Tunis et les pièces à demander au vendeur ou au promoteur.' },
  { tag: 'Quartiers', title: 'La Soukra ou Gammarth : où acheter une villa en 2026 ?', text: 'Prix au m², temps de trajet vers le Lac et les écoles, programmes neufs en cours : le comparatif de deux secteurs phares du nord de Tunis.' },
  { tag: 'Louer', title: 'Louer meublé à La Marsa : le bail, la caution, les charges', text: 'Ce que prévoit la loi tunisienne, ce que pratiquent les propriétaires, et comment éviter les mauvaises surprises.' },
  { tag: 'Vendre', title: 'Pourquoi une visite en vidéo fait vendre plus vite', text: 'Les acheteurs de la diaspora décident à distance. Comment nous filmons vos biens et ce que ça change sur le délai de vente.' },
  { tag: 'Investir', title: 'Bureaux et locaux commerciaux : les zones qui se louent en moins d\'un mois', text: 'Mutuelleville, Lac 1, Centre Urbain Nord : rendement, demande et profils de locataires.' },
  { tag: 'Acheter', title: 'Frais d\'acquisition en Tunisie : le vrai budget à prévoir', text: 'Droits d\'enregistrement, honoraires, conservation foncière : le détail poste par poste, avec un exemple chiffré.' },
]

export function Conseils() {
  useTop()
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="eyebrow">Conseils</div>
          <h1 className="h-section">Comprendre le marché avant de décider</h1>
          <p className="lead mt-16" style={{ maxWidth: 640 }}>Nos conseillers répondent aux questions qu'on leur pose le plus souvent en agence.</p>
          <div className="grid grid-3 mt-32">
            {ARTICLES.map((a) => (
              <article key={a.title} className="card st-article">
                <span className="badge badge-soft">{a.tag}</span>
                <h3 className="h-card mt-16">{a.title}</h3>
                <p className="muted mt-16 small" style={{ lineHeight: 1.65 }}>{a.text}</p>
                <Link to="/contact" className="link small mt-16">Poser la question à un conseiller</Link>
              </article>
            ))}
          </div>
          <div className="mt-48">
            <CtaBanner title="Une question sur votre projet ?" text="Notre équipe vous répond par téléphone, e-mail ou WhatsApp pendant les horaires d'ouverture." />
          </div>
        </div>
      </section>
    </>
  )
}
