import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import logoLight from '../assets/logo-light.png'

/**
 * Logo officiel Confort Immo (généré depuis logo.png par scripts/build-logo.py).
 * `light` = variante pour fonds sombres (« CONFORT » et le cadre en blanc).
 */
export default function Logo({ height = 44, light = false }: { height?: number; light?: boolean }) {
  return (
    <Link to="/" className="logo" aria-label="Confort Immo — accueil" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img src={light ? logoLight : logo} alt="Confort Immo" height={height} style={{ height, width: 'auto', maxWidth: 'none', display: 'block' }} />
    </Link>
  )
}
