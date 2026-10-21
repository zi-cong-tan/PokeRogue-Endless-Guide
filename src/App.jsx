import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import { allSections, chapters } from './chapters.js'
import Search from './Search.jsx'
import TokenCalc from './TokenCalc.jsx'

gsap.registerPlugin(ScrollTrigger)

const DOC = 'https://docs.google.com/document/d/1vAgiz1xfT3Ul-ZEmP7B4saDt_kX-_mnAIe3pu8kv-rk/edit'
const BASE = import.meta.env.BASE_URL

const CREDITS = [
  ['Monkee', 'wrote the guide'],
  ['Lululalu_a', 'wrote the guide'],
  ['Excoman', 'feedback, early review, grammar'],
  ['Table', 'feedback, early review, grammar, formatting'],
  ['Andr', 'feedback, early review'],
  ['Sang', 'feedback, early review, grammar, formatting, sub-editor'],
  ['Grex', 'early review, visual guides, the Normalise build'],
  ['Gyaradope', 'feedback, early review, sub-editor'],
  ['Sandstorm', 'feedback, early review, formatting, the SearchDex'],
  ['Steven', 'formatting'],
  ['Pepo', 'sub-editor, the Floedinja build'],
  ['Aoisme', 'added a page'],
  ['Squid', 'grammar'],
]

// The standard triple lure team from the Builds chapter, as the party on the title page.
const PARTY = [
  [382, 'Kyogre', 'Carry', 'carry'],
  [771, 'Pyukumuku', 'Boss killer', 'boss-killer'],
  [216, 'Teddiursa', 'Runner', 'runner'],
  [235, 'Smeargle', 'Tutor', 'tutor'],
  [656, 'Froakie', 'Tutor', 'tutor'],
  [710, 'Pumpkaboo', 'Waiter', 'waiter'],
]

// Animated Showdown sprites, drawn at k times their own pixel size so every Pokémon keeps its relative size.
const SHOWDOWN = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/'
function Mon({ id, name, k = 2, className = '' }) {
  return (
    <img
      className={`mon ${className}`} src={`${SHOWDOWN}${id}.gif`} alt={name} style={{ '--k': k }}
      onLoad={e => e.currentTarget.style.setProperty('--w', e.currentTarget.naturalWidth)}
    />
  )
}

const RESOURCES = [
  ['Sandstorm’s SearchDex', 'https://sandstormer.github.io/PokeRogue-Dex/'],
  ['PokeRogue wiki', 'https://wiki.pokerogue.net/start'],
  ['Biome calculator', 'https://pokerogue-biomes.vercel.app/'],
  ['Team planner', 'https://triickstr.github.io/PokeRogue-Team-Planner/'],
  ['Fusion tool', 'https://akrelia.github.io/PokeRogueFusion/'],
  ['Gyara’s mid-run guide', 'https://docs.google.com/document/d/1JX46MwkoQqqA2KDScGEr7SXWjbOBDhFgZrQsgiJzB2s/edit?usp=drivesdk'],
  ['Official Discord', 'https://discord.com/invite/pokerogue'],
]

export default function App() {
  const root = useRef(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [here, setHere] = useState({ chapter: null, section: null })

  // The content renders after the browser tried to follow the #link, so follow it once it exists.
  useEffect(() => {
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
  }, [])

  // "/" or Ctrl/Cmd+K opens search.
  useEffect(() => {
    const onKey = e => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  // The header takes the colours of the field under it, and each chapter's side list follows the reader.
  useEffect(() => {
    const watch = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setHere(h => ({ ...h, chapter: e.target.dataset.field ? e.target : h.chapter }))
    }, { rootMargin: '-0px 0px -96% 0px' })
    document.querySelectorAll('[data-field]').forEach(el => watch.observe(el))
    // The current section is the last main heading above the top third of the screen.
    const heads = allSections.filter(s => s.depth === 2).map(s => document.getElementById(s.id)).filter(Boolean)
    const read = () => {
      const line = innerHeight / 3
      const cur = heads.findLast(h => h.getBoundingClientRect().top < line)
      setHere(h => (h.section === cur?.id ? h : { ...h, section: cur?.id }))
    }
    addEventListener('scroll', read, { passive: true })
    read()
    return () => { watch.disconnect(); removeEventListener('scroll', read) }
  }, [])

  // On phones the tabs scroll sideways; keep the current one in view.
  useEffect(() => {
    const tab = document.querySelector('.bar-tabs [aria-current]')
    if (tab) tab.parentElement.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' })
  }, [here.chapter])

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-boss', { y: -60, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', delay: 0.2 })
      gsap.to('.hero-boss .mon', { y: -14, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.from('.party li', { y: 40, opacity: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.5, stagger: 0.07 })
      gsap.from('.hero-line', { yPercent: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12 })
      gsap.from('.hero-foot > *', { y: 16, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.4, stagger: 0.08 })
      gsap.utils.toArray('.contents li').forEach(li => {
        gsap.from(li, { y: 32, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 92%', once: true } })
      })
      gsap.utils.toArray('.opener').forEach(el => {
        gsap.from(el.querySelectorAll('.opener-title, .opener .mon, .opener-lead, .opener-facts'), {
          y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        })
      })
      gsap.to('.credits-shot img', { scale: 1.08, duration: 14, ease: 'none', yoyo: true, repeat: -1 })
    })
  }, { scope: root })

  const field = here.chapter?.dataset.field ?? 'blue'

  return (
    <div ref={root}>
      <header className="bar" data-on={field}>
        <a className="bar-mark" href="#top">Endless Guide</a>
        <nav className="bar-tabs" aria-label="Chapters">
          {chapters.map(c => (
            <a key={c.id} href={`#${c.id}`} aria-current={here.chapter?.id === c.id ? 'location' : undefined}>{c.title}</a>
          ))}
        </nav>
        <button type="button" className="bar-search" onClick={() => setSearchOpen(true)}>Search <kbd>/</kbd></button>
      </header>

      <main>
        <section className="hero field-blue" id="top" data-field="blue">
          <div className="hero-top">
            <h1>
              <span className="hero-line hero-pale">Endless,</span>
              <span className="hero-line">to 5850.</span>
            </h1>
            <figure className="hero-boss">
              <Mon id={890} name="Eternatus" k={3.4} />
              <figcaption>Eternatus, every 250 waves</figcaption>
            </figure>
          </div>
          <div className="hero-foot">
            <nav className="party" aria-label="A standard Endless team">
              <ul>
              {PARTY.map(([id, name, role, to]) => (
                <li key={id}>
                  <a href={`#${to}`}>
                    <span className="party-mon"><Mon id={id} name="" k={2} /></span>
                    <strong>{name}</strong> {role}
                  </a>
                </li>
              ))}
              </ul>
            </nav>
            <p>The PokeRogue community’s Endless guide, by Monkee, Lululalu_a and the top Endless players on Discord. Rebuilt as a website so you can find what you need between waves.</p>
            <div className="hero-actions">
              <a className="button" href="#contents">Start reading</a>
              <button type="button" className="link" onClick={() => setSearchOpen(true)}>Search the guide</button>
            </div>
          </div>
        </section>

        <nav className="contents field-ink" id="contents" aria-label="Chapters" data-field="ink" data-title="Contents">
          <ol>
            {chapters.map(c => (
              <li key={c.id}>
                <a href={`#${c.id}`}>
                  <span className="contents-name">{c.title}<Mon id={c.mon[0]} name="" k={1.5} /></span>
                  <span className="contents-fact">{c.sections.filter(s => s.depth === 2).length} parts</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {chapters.map(c => <Chapter key={c.id} chapter={c} active={here.section} />)}

        <section className="credits field-pink" id="credits" data-field="pink" data-title="Credits">
          <div className="credits-tile credits-statement">
            <h2>Credits</h2>
            <p>
              Everything here comes from the <a href={DOC} target="_blank" rel="noopener">Community Endless guide</a> on Google Docs,
              written by Monkee and Lululalu_a with input from many of the top Endless players on the PokeRogue Discord. This site only
              reorganises it. For suggestions or questions, ping <strong>cool_monkee</strong> on Discord.
            </p>
          </div>
          <ul className="credits-tile credits-people">
            {CREDITS.map(([who, what]) => <li key={who}><strong>{who}</strong> {what}</li>)}
          </ul>
          <ul className="credits-tile credits-links">
            {RESOURCES.map(([name, url]) => <li key={url}><a href={url} target="_blank" rel="noopener">{name}</a></li>)}
          </ul>
          <figure className="credits-tile credits-shot">
            <img src={`${BASE}shots/doubles-5024.png`} alt="A triple lure double battle at wave 5024: Gourgeist and Teddiursa against two bosses" width="602" height="339" loading="lazy" />
          </figure>
          <a className="credits-tile credits-classic" href="https://zi-cong-tan.github.io/PokeRogue-Classic-Guide/">
            <span>Playing Classic instead?</span>
            <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M8 32 32 8M14 8h18v18" fill="none" stroke="currentColor" strokeWidth="4" /></svg>
          </a>
          <p className="credits-tile credits-mark" aria-hidden="true">Endless</p>
          <p className="credits-tile credits-legal">
            A fan site, not affiliated with PokeRogue or Pokémon. Pokémon sprites from PokeAPI, animated ones from Pokémon Showdown; token icons from pokerogue-assets (CC BY-NC-SA 4.0);
            screenshots from the guide. Site by <a href="https://github.com/zi-cong-tan">Zi</a>.
          </p>
        </section>
      </main>

      <Search open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

function Chapter({ chapter: c, active }) {
  const parts = c.sections.filter(s => s.depth === 2)
  return (
    <section className={`chapter field-${c.field}`} id={c.id} data-field={c.field} data-title={c.title} aria-labelledby={`${c.id}-title`}>
      <div className="opener">
        <div className="opener-head">
          <h2 className="opener-title" id={`${c.id}-title`}>{c.title}</h2>
          <Mon id={c.mon[0]} name={c.mon[1]} k={3} />
        </div>
        <p className="opener-lead">{c.lead}</p>
        <ol className="opener-facts">
          {parts.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
        </ol>
      </div>
      <div className="body">
        <nav className="side" aria-label={`${c.title} sections`}>
          <ol>
            {parts.map(s => (
              <li key={s.id}><a href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined}>{s.title}</a></li>
            ))}
          </ol>
        </nav>
        <div className="reading">
          {c.parts.map((html, i) => (
            <div key={i} className="prose">
              <div dangerouslySetInnerHTML={{ __html: html }} />
              {i < c.parts.length - 1 && <TokenCalc />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
