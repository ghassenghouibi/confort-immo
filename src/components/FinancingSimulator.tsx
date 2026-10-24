import { useState } from 'react'
import { Sparkle } from './Icons'
import './FinancingSimulator.css'

/**
 * Simulateur de crédit immobilier (mensualités constantes).
 * Valeurs par défaut indicatives pour la Tunisie : taux ≈ TMM + marge bancaire,
 * apport de 20 % minimum, taux d'endettement plafonné à 40 % des revenus nets.
 */

const DEFAULT_PRICE = 450_000
const DEFAULT_RATE = 9.5
const DURATIONS = [10, 15, 20, 25]
const MAX_DEBT_RATIO = 0.4

const dt = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} DT`

/** Mensualité d'un prêt amortissable à taux fixe */
export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  const n = years * 12
  const r = annualRate / 100 / 12
  if (principal <= 0 || n <= 0) return 0
  if (r === 0) return principal / n
  return (principal * r) / (1 - (1 + r) ** -n)
}

export default function FinancingSimulator({ price }: { price?: number | null }) {
  const [prix, setPrix] = useState(price && price > 0 ? price : DEFAULT_PRICE)
  const [apportPct, setApportPct] = useState(20)
  const [years, setYears] = useState(20)
  const [rate, setRate] = useState(DEFAULT_RATE)

  const apport = Math.round((prix * apportPct) / 100)
  const emprunt = Math.max(0, prix - apport)
  const mensualite = monthlyPayment(emprunt, rate, years)
  const total = mensualite * years * 12
  const interets = Math.max(0, total - emprunt)
  const revenus = mensualite / MAX_DEBT_RATIO
  const share = total > 0 ? (emprunt / total) * 100 : 100

  const num = (v: string) => Number(v.replace(/\s/g, '').replace(',', '.')) || 0

  return (
    <div className="card fs">
      <div className="row" style={{ gap: 8, fontWeight: 700 }}><Sparkle size={17} style={{ color: 'var(--blue)' }} /> Simulateur de financement</div>
      <p className="small muted mt-8">Estimez vos mensualités et le revenu nécessaire pour emprunter.</p>

      <div className="fs-fields mt-16">
        {price == null && (
          <label className="fs-field">
            <span className="label">Prix du bien</span>
            <div className="fs-input">
              <input className="input" inputMode="numeric" value={prix.toLocaleString('fr-FR')} onChange={(e) => setPrix(num(e.target.value))} />
              <span>DT</span>
            </div>
          </label>
        )}

        <label className="fs-field">
          <span className="row between"><span className="label">Apport</span><strong className="small">{apportPct} % · {dt(apport)}</strong></span>
          <input type="range" min={0} max={80} step={5} value={apportPct} onChange={(e) => setApportPct(Number(e.target.value))} />
        </label>

        <div className="fs-field">
          <span className="label">Durée</span>
          <div className="fs-seg" role="radiogroup" aria-label="Durée du prêt">
            {DURATIONS.map((d) => (
              <button key={d} type="button" role="radio" aria-checked={years === d} className={years === d ? 'on' : ''} onClick={() => setYears(d)}>{d} ans</button>
            ))}
          </div>
        </div>

        <label className="fs-field">
          <span className="row between"><span className="label">Taux annuel</span><strong className="small">{rate.toFixed(2).replace('.', ',')} %</strong></span>
          <input type="range" min={5} max={14} step={0.25} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
      </div>

      <div className="fs-result mt-16">
        <span className="label">Mensualité estimée</span>
        <div className="fs-monthly">{dt(mensualite)}<span> / mois</span></div>
        <div className="fs-bar" aria-hidden="true"><span style={{ width: `${share}%` }} /></div>
        <dl className="fs-lines">
          <div><dt><i className="fs-dot" /> Montant emprunté</dt><dd>{dt(emprunt)}</dd></div>
          <div><dt><i className="fs-dot fs-dot-int" /> Coût des intérêts</dt><dd>{dt(interets)}</dd></div>
          <div><dt>Revenus nets conseillés</dt><dd>{dt(revenus)} / mois</dd></div>
        </dl>
      </div>

      {apportPct < 20 && <p className="small fs-warn mt-8">Les banques demandent en général un apport d'au moins 20 %.</p>}
      <p className="small muted mt-8">Simulation indicative, hors assurance et frais de dossier. Taux d'endettement retenu : 40 %.</p>
    </div>
  )
}
