import { Link } from 'react-router-dom'
import Logo from './Logo'
import { Facebook, Instagram, TikTok } from './Icons'
import { AGENCIES, CONTACT } from '../data/agences'
import { SOCIAL } from '../data/videos'
import { LISTINGS, ZONES, zoneCount } from '../lib/listings'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="container">
        <div className="ftr-grid">
          <div>
            <Logo light height={46} />
            <p className="ftr-blurb">
              Agence immobilière à la Charguia, active de La Marsa aux Berges du Lac. {LISTINGS.length} biens à vendre et à louer, sélectionnés et accompagnés par notre équipe.
            </p>
            <div className="row" style={{ gap: 8, marginTop: 20 }}>
              <a className="ftr-social" href={SOCIAL.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
              <a className="ftr-social" href={SOCIAL.tiktok.url} target="_blank" rel="noreferrer" aria-label="TikTok"><TikTok size={17} /></a>
              <a className="ftr-social" href={SOCIAL.facebook.url} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17} /></a>
            </div>
          </div>
          <div>
            <h4>Rechercher</h4>
            <ul>
              <li><Link to="/acheter">Acheter</Link></li>
              <li><Link to="/louer">Louer</Link></li>
              <li><Link to="/bureaux-et-commerces">Bureaux & commerces</Link></li>
              <li><Link to="/acheter?type=Terrain">Terrains</Link></li>
              <li><Link to="/videos">Visites en vidéo</Link></li>
            </ul>
          </div>
          <div>
            <h4>Quartiers</h4>
            <ul>
              {ZONES.filter((z) => zoneCount(z) > 0).map((z) => (
                <li key={z.slug}><Link to={`/acheter?zone=${z.slug}`}>{z.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>L'agence</h4>
            <ul>
              {AGENCIES.map((a) => (
                <li key={a.slug}>
                  <Link to="/agences">{a.name}</Link>
                  <span className="ftr-phone">{a.address}</span>
                  <span className="ftr-phone">{a.phone}{a.phone2 ? ` · ${a.phone2}` : ''}</span>
                </li>
              ))}
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="ftr-bottom">
          <span>© {new Date().getFullYear()} Confort Immo · Agence immobilière, Tunis</span>
          <div className="row" style={{ gap: 20 }}>
            <Link to="/deposer">Déposer mon bien</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/conseils">Conseils</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
