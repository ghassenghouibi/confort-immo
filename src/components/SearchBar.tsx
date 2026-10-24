import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from './Icons'
import { BUDGETS_LOCATION, BUDGETS_VENTE, CATEGORIES, CATEGORY_LABEL, ZONES, zoneCount, type Rubrique } from '../lib/listings'
import './SearchBar.css'

type Tab = Rubrique | 'terrains'
const TABS: { key: Tab; label: string }[] = [
  { key: 'acheter', label: 'Acheter' },
  { key: 'louer', label: 'Louer' },
  { key: 'bureaux-et-commerces', label: 'Bureaux & commerces' },
  { key: 'terrains', label: 'Terrains' },
]

export default function SearchBar() {
  const nav = useNavigate()
  const [tab, setTab] = useState<Tab>('acheter')
  const [zone, setZone] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')
  const [pieces, setPieces] = useState('')
  const budgets = tab === 'louer' ? BUDGETS_LOCATION : BUDGETS_VENTE

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const rubrique: Rubrique = tab === 'terrains' ? 'acheter' : tab
    const q = new URLSearchParams()
    if (zone) q.set('zone', zone)
    const t = tab === 'terrains' ? 'Terrain' : type
    if (t) q.set('type', t)
    if (budget) q.set('budget', budget)
    if (pieces) q.set('pieces', pieces)
    nav(`/${rubrique}${q.toString() ? `?${q}` : ''}`)
  }

  return (
    <form className="sb card" onSubmit={submit}>
      <div className="sb-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'on' : ''}
            onClick={() => { setTab(t.key); setBudget('') }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="sb-fields">
        <label className="sb-field">
          <span className="label">Où</span>
          <select className="select sb-select" value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="">Tout le Grand Tunis</option>
            {ZONES.filter((z) => zoneCount(z) > 0).map((z) => (
              <option key={z.slug} value={z.slug}>{z.name}</option>
            ))}
          </select>
        </label>
        {tab !== 'terrains' && (
          <label className="sb-field">
            <span className="label">Type de bien</span>
            <select className="select sb-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous les types</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </label>
        )}
        <label className="sb-field">
          <span className="label">Budget</span>
          <select className="select sb-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Tous les budgets</option>
            {budgets.map((b) => (
              <option key={b} value={b}>Jusqu'à {b.toLocaleString('fr-FR')} DT{tab === 'louer' ? ' / mois' : ''}</option>
            ))}
          </select>
        </label>
        {tab !== 'terrains' && tab !== 'bureaux-et-commerces' && (
          <label className="sb-field">
            <span className="label">Pièces</span>
            <select className="select sb-select" value={pieces} onChange={(e) => setPieces(e.target.value)}>
              <option value="">Indifférent</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>S+{n} et plus</option>)}
            </select>
          </label>
        )}
        <button type="submit" className="btn btn-primary btn-lg sb-submit"><Search size={18} /> Rechercher</button>
      </div>
    </form>
  )
}
