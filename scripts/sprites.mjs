// Finds every ![Name](sprite:pokeapi-name) in the chapters and writes their PokeAPI sprite URLs to src/sprites.json.
// Run again after adding a Pokémon to a chapter: node scripts/sprites.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../src/content/', import.meta.url)
const names = new Set()
for (const f of readdirSync(dir)) for (const m of readFileSync(new URL(f, dir), 'utf8').matchAll(/\(sprite:([a-z0-9-]+)\)/g)) names.add(m[1])

const out = {}
for (const name of [...names].sort()) {
  // Some forms (like Spiky-eared Pichu) only exist as a pokemon-form.
  let url
  for (const kind of ['pokemon', 'pokemon-form']) {
    const res = await fetch(`https://pokeapi.co/api/v2/${kind}/${name}`)
    if (res.ok && (url = (await res.json()).sprites.front_default)) break
  }
  if (url) out[name] = url
  else console.log('MISSING', name)
}
writeFileSync(new URL('../src/sprites.json', import.meta.url), JSON.stringify(out, null, 1) + '\n')
console.log(Object.keys(out).length, 'sprites')
