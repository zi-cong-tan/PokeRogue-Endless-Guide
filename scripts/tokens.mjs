// Print the tokens wild Pokémon have at a wave:  node scripts/tokens.mjs 2000
// Self-check of the token maths:                 node scripts/tokens.mjs --check
import assert from 'node:assert/strict'
import { averageRuns, mulberry32, nextBoss, picksAt, simulate, stackSize, tokensAt, TOKENS } from '../src/tokens.js'

const arg = process.argv[2]

if (arg === '--check') {
  assert.equal(stackSize(50), 1)
  assert.equal(stackSize(750), 3)
  assert.equal(stackSize(3000), 5)
  assert.equal(picksAt(50), 1)
  assert.equal(picksAt(251), 2)
  const run = simulate(mulberry32(1))
  assert.equal(run[0].wave, 50)
  const total = row => Object.keys(TOKENS).reduce((s, k) => s + row[k], 0)
  assert.equal(total(run[0]), 1, 'one token after the first paradox')
  assert.ok(run.find(r => r.wave === 1950).protection <= 5, 'protection capped at 5 before wave 2000')
  for (const row of run) for (const k in TOKENS) assert.ok(row[k] <= TOKENS[k].cap, `${k} over cap at ${row.wave}`)
  assert.deepEqual(nextBoss(1), { wave: 50, name: 'A Paradox Pokémon' })
  assert.equal(nextBoss(990).name, 'Eternamax Eternatus')
  assert.equal(nextBoss(5800).name, 'The final wave')
  console.log('token maths ok; wave 5800 in one run:', Object.fromEntries(Object.keys(TOKENS).map(k => [k, run.at(-2)[k]])))
} else {
  const wave = Math.max(0, Math.min(5850, Number(arg) || 1000))
  const row = tokensAt(averageRuns(), wave)
  console.log(`Wave ${wave}: average tokens on wild Pokémon (300 simulated runs)`)
  for (const [k, t] of Object.entries(TOKENS)) console.log(`  ${t.name.padEnd(11)} ${String(Math.round(row[k])).padStart(4)}  ${t.effect(Math.round(row[k]))}`)
  const next = nextBoss(wave)
  console.log(`Next boss: ${next.name} on wave ${next.wave}`)
}
