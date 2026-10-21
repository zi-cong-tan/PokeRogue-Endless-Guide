// Enemy tokens in Endless, taken from the game source (pagefaultgames/pokerogue, beta, Oct 2026):
// victory-phase.ts gives tokens after every 50th wave, add-enemy-buff-modifier-phase.ts decides how many,
// modifier-type.ts / init-modifier-pools.ts / modifier.ts give the weights, stack sizes and caps.

export const FINAL_WAVE = 5850

const icon = name => `https://raw.githubusercontent.com/pagefaultgames/pokerogue-assets/beta/images/items/${name}.png`

export const TOKENS = {
  heal: { name: 'Recovery', icon: icon('wl_potion'), cap: 10, per: 2, effect: n => `heals ${n * 2}% of max HP each turn` },
  statusHeal: { name: 'Full Heal', icon: icon('wl_full_heal'), cap: 10, per: 2.5, effect: n => `${n * 2.5}% chance to cure its status each turn` },
  fusion: { name: 'Fusion', icon: icon('wl_custom_spliced'), cap: 10, per: 1, effect: n => `${n}% chance a wild Pokémon is fused` },
  endure: { name: 'Endure', icon: icon('wl_reset_urge'), cap: 10, per: 2, effect: n => `${n * 2}% chance to endure a hit` },
  protection: { name: 'Protection', icon: icon('wl_guard_spec'), cap: 999, effect: n => `you deal ×${fmt(0.975 ** n)} damage` },
  damage: { name: 'Damage', icon: icon('wl_item_drop'), cap: 999, effect: n => `they deal ×${fmt(1.05 ** n)} damage` },
  poison: { name: 'Poison', icon: icon('wl_antidote'), cap: 10, per: 5, effect: n => `${n * 5}% chance to poison you on any hit` },
  paralysis: { name: 'Paralysis', icon: icon('wl_paralyze_heal'), cap: 10, per: 2.5, effect: n => `${n * 2.5}% chance to paralyse you on any hit` },
  burn: { name: 'Burn', icon: icon('wl_burn_heal'), cap: 10, per: 5, effect: n => `${n * 5}% chance to burn you on any hit` },
}

// Weighted pools: common after X50 waves, great after X250, ultra after X000.
const POOLS = {
  1: [['damage', 9], ['protection', 9], ['poison', 3], ['paralysis', 3], ['burn', 3], ['statusHeal', 9], ['endure', 4], ['fusion', 1]],
  3: [['damage', 5], ['protection', 5], ['statusHeal', 5], ['endure', 5], ['fusion', 1]],
  5: [['damage', 10], ['protection', 10], ['heal', 10], ['statusHeal', 10], ['endure', 10], ['fusion', 5]],
}

function fmt(x) {
  if (x >= 1e6) return x.toExponential(1).replace('e+', '×10^')
  if (x >= 1000) return Math.round(x).toLocaleString('en')
  if (x >= 10) return x.toFixed(0)
  if (x >= 0.01) return x.toFixed(2)
  return x.toExponential(1).replace('e', '×10^')
}

// Protection stops at 5 stacks until wave 2000, then 999 (EnemyDamageReducerModifier.getMaxStackCount).
const capAt = (id, wave) => (id === 'protection' && wave < 2000 ? 5 : TOKENS[id].cap)

export function stackSize(wave) {
  return wave % 1000 === 0 ? 5 : wave % 250 === 0 ? 3 : 1
}

export const picksAt = wave => Math.ceil(wave / 250)

function pick(pool, rand) {
  let r = rand() * pool.reduce((s, [, w]) => s + w, 0)
  for (const [id, w] of pool) if ((r -= w) < 0) return id
  return pool[pool.length - 1][0]
}

// One run: the tokens owned after beating the boss on each X50 wave, with the game's re-roll rule.
export function simulate(rand, lastWave = FINAL_WAVE) {
  const have = Object.fromEntries(Object.keys(TOKENS).map(k => [k, 0]))
  const after = []
  for (let wave = 50; wave <= lastWave; wave += 50) {
    const size = stackSize(wave)
    for (let i = 0; i < picksAt(wave); i++) {
      let id = pick(POOLS[size], rand)
      for (let r = 1; r < 50 && have[id] > 0 && capAt(id, wave) < have[id] + (r < 10 ? size : 1); r++) id = pick(POOLS[size], rand)
      have[id] = Math.min(capAt(id, wave), have[id] + size)
    }
    after.push({ wave, ...have })
  }
  return after
}

export function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Average of many runs, so the page shows what a typical run looks like at each boss wave.
export function averageRuns(runs = 300, seed = 5850) {
  const rand = mulberry32(seed)
  const sum = simulate(() => 0).map(({ wave }) => ({ wave, ...Object.fromEntries(Object.keys(TOKENS).map(k => [k, 0])) }))
  for (let n = 0; n < runs; n++) {
    simulate(rand).forEach((row, i) => { for (const k in TOKENS) sum[i][k] += row[k] / runs })
  }
  return sum
}

export function tokensAt(table, wave) {
  const row = table[Math.floor(wave / 50) - 1]
  return row ?? { wave: 0, ...Object.fromEntries(Object.keys(TOKENS).map(k => [k, 0])) }
}

export function nextBoss(wave) {
  if (wave >= FINAL_WAVE) return { wave: FINAL_WAVE, name: 'The end of Endless' }
  const w = Math.floor(wave / 50) * 50 + 50
  const name = w === FINAL_WAVE ? 'The final wave' : w % 1000 === 0 ? 'Eternamax Eternatus' : w % 250 === 0 ? 'Eternatus' : 'A Paradox Pokémon'
  return { wave: w, name }
}

export { fmt }
