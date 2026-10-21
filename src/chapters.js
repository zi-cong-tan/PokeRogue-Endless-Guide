import { Marked } from 'marked'
import shots from './shots.json'
import sprites from './sprites.json'
import works from './content/how-endless-works.md?raw'
import fusion from './content/fusion.md?raw'
import team from './content/forming-a-team.md?raw'
import builds from './content/builds.md?raw'
import run from './content/playing-a-run.md?raw'
import enders from './content/run-enders.md?raw'
import mistakes from './content/mistakes.md?raw'

// Each chapter is one colour field. Order follows the original guide's tabs.
const CHAPTERS = [
  { id: 'mechanics', title: 'Mechanics', lead: 'How Endless works: the end, tokens, and what changes from Classic.', field: 'pink', md: works },
  { id: 'fusion', title: 'Fusion', lead: 'DNA Splicers, fuse tutoring and Spliced Endless.', field: 'sand', md: fusion },
  { id: 'the-team', title: 'The team', lead: 'The six roles: carry, waiter, runner, supports, tutor and boss killer.', field: 'sage', md: team },
  { id: 'builds', title: 'Builds', lead: 'Complete teams, from the standard triple lure to Floedinja.', field: 'peach', md: builds },
  { id: 'the-run', title: 'The run', lead: 'Building between waves 1000 and 2000, then running and catching shinies.', field: 'blue', md: run },
  { id: 'run-enders', title: 'Run enders', lead: 'Neutralizing Gas, the Paradoxes, Eternatus fusions and shiny obstacles.', field: 'ink', md: enders },
  { id: 'mistakes', title: 'Mistakes', lead: 'Noob traps: Well-Baked Body, Candy Jars, wasted slots and the wrong Tera.', field: 'sand', md: mistakes },
]

const BASE = import.meta.env.BASE_URL
const used = new Set(CHAPTERS.map(c => c.id))
const slug = text => {
  const base = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '').toLowerCase().replace(/<[^>]+>/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  let id = base
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`
  used.add(id)
  return id
}
const plain = s => s.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`|#>-]+/g, ' ').replace(/\s+/g, ' ').trim()

const marked = new Marked({
  renderer: {
    heading({ tokens, depth, text }) {
      const id = slug(text)
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`
    },
    image({ href, text }) {
      if (href.startsWith('sprite:')) {
        const src = sprites[href.slice(7)]
        return src ? `<img class="sprite" src="${src}" alt="${text}" width="96" height="96" loading="lazy">` : ''
      }
      const [w, h] = shots[href.replace('shots/', '')] ?? []
      return `<img class="shot" src="${BASE}${href}" alt="${text}" width="${w}" height="${h}" loading="lazy">`
    },
    link({ href, tokens }) {
      const out = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${href}"${out}>${this.parser.parseInline(tokens)}</a>`
    },
  },
})

export const chapters = CHAPTERS.map(ch => {
  const tokens = marked.lexer(ch.md)
  const html = marked.parser(tokens)
  // Sections for the side list and search: every ## and ### with the text under it.
  const sections = []
  const ids = [...html.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)]
  let i = 0
  for (const t of tokens) {
    if (t.type === 'heading' && t.depth <= 3) {
      const [, depth, id, title] = ids[i++]
      sections.push({ id, depth: Number(depth), title: title.replace(/<[^>]+>/g, ''), chapter: ch.title, chapterId: ch.id, text: '' })
    } else if (sections.length) sections.at(-1).text += ' ' + plain(t.raw)
  }
  return { ...ch, parts: html.split('<p>{{tokens}}</p>'), sections }
})

export const allSections = chapters.flatMap(c => c.sections)
