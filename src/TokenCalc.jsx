import { useMemo, useState } from 'react'
import { averageRuns, fmt, nextBoss, TOKENS, tokensAt } from './tokens.js'

// "1.5×10^21" -> 1.5×10 with a superscript 21
const Num = ({ s }) => {
  const [a, b] = s.split('^')
  return b ? <>{a}<sup>{b}</sup></> : s
}

const JUMPS = [50, 250, 1000, 2000, 5000, 5800]

export default function TokenCalc() {
  const table = useMemo(() => averageRuns(), [])
  const [wave, setWave] = useState(1000)
  const row = tokensAt(table, wave)
  const n = id => Math.round(row[id])
  const boss = nextBoss(wave)

  return (
    <figure className="calc" aria-labelledby="calc-title">
      <h3 id="calc-title">What the wild Pokémon have at wave</h3>
      <div className="calc-wave">
        <input
          type="number" min="1" max="5850" value={wave} aria-label="Wave"
          onChange={e => setWave(Math.max(1, Math.min(5850, Number(e.target.value) || 1)))}
        />
        <input type="range" min="1" max="5850" value={wave} aria-label="Wave slider" onChange={e => setWave(Number(e.target.value))} />
        <div className="calc-jumps">
          {JUMPS.map(w => (
            <button type="button" key={w} aria-pressed={wave === w} onClick={() => setWave(w)}>{w.toLocaleString('en')}</button>
          ))}
        </div>
      </div>

      <div className="calc-big">
        <p><strong>×<Num s={fmt(1.05 ** n('damage'))} /></strong> damage they deal to you</p>
        <p><strong>×<Num s={fmt(0.975 ** n('protection'))} /></strong> damage you deal to them</p>
      </div>

      <ul className="calc-rows">
        {Object.entries(TOKENS).map(([id, t]) => (
          <li key={id}>
            <img src={t.icon} alt="" width="32" height="32" loading="lazy" />
            <span className="calc-name">{t.name}</span>
            <span className="calc-n">{n(id)}</span>
            {/* Damage and Protection go to 999, so their bars use a log scale to stay readable. */}
            <span className="calc-bar" aria-hidden="true"><i style={{ '--fill': t.cap === 999 ? Math.log1p(row[id]) / Math.log1p(999) : row[id] / 10 }} /></span>
            <span className="calc-effect">{n(id) ? t.effect(n(id)) : 'none yet'}</span>
          </li>
        ))}
      </ul>

      <figcaption>
        Next boss: <strong>{boss.name}</strong>{boss.wave > wave ? ` on wave ${boss.wave.toLocaleString('en')}` : ''}.
        {' '}Averages of 300 simulated runs using the game's own token weights, so real runs vary.
        Tokens come after each 50th wave: one pick per 250 waves climbed, worth 1 stack, 3 on an Eternatus wave and 5 on an Eternamax wave.
        Protection stops at 5 until wave 2000.
      </figcaption>
    </figure>
  )
}
