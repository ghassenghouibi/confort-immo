import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { Heart, Menu, X } from './Icons'
import { useFavorites } from '../hooks/useFavorites'
import './Header.css'

const NAV = [
  { to: '/acheter', label: 'Acheter' },
  { to: '/louer', label: 'Louer' },
  { to: '/bureaux-et-commerces', label: 'Bureaux & commerces' },
  { to: '/agences', label: "L'agence" },
  { to: '/videos', label: 'Vidéos' },
  { to: '/conseils', label: 'Conseils' },
  { to: '/contact', label: 'Contact' },
]

/** `overlay` : en-tête transparent posé sur le hero (page d'accueil), qui devient blanc dès qu'on scrolle. */
export default function Header({ overlay = false }: { overlay?: boolean }) {
  const { count } = useFavorites()
  const { pathname } = useLocation()
  // Le menu mobile mémorise la route où il a été ouvert : il se referme donc de lui-même à la navigation.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])
  const transparent = overlay && !scrolled && !open

  return (
    <header className={`hdr${overlay ? ' hdr-overlay' : ''}${transparent ? ' hdr-transparent' : ''}`}>
      <div className="hdr-main">
        <div className="container row between">
          <Logo height={42} light={transparent} />
          <nav className="hdr-nav hide-mobile">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="row" style={{ gap: 12 }}>
            <Link to="/favoris" className="btn btn-outline hdr-fav" aria-label="Favoris">
              <Heart size={17} filled={count > 0} />
              <span className="hide-mobile">{count > 0 ? count : 'Favoris'}</span>
            </Link>
            <Link to="/deposer" className="btn btn-primary hdr-deposit hide-mobile">Déposer mon bien</Link>
            <button className="btn btn-outline btn-icon show-mobile" onClick={() => setOpenAt(open ? null : pathname)} aria-label="Menu">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <div className="hdr-mobile">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/deposer" className="btn btn-primary btn-block mt-16">Déposer mon bien</Link>
          </div>
        )}
      </div>
    </header>
  )
}
