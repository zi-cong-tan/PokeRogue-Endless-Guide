import { useEffect, useMemo, useRef, useState } from 'react'
import { allSections, chapters } from './chapters.js'

// Every word typed must appear in the section's title or text; title matches rank first.
function find(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return allSections
    .map(s => {
      const title = s.title.toLowerCase()
      const text = s.text.toLowerCase()
      if (!words.every(w => title.includes(w) || text.includes(w))) return null
      const at = text.indexOf(words[0])
      const snippet = at < 0 ? s.text.slice(0, 120) : (at > 40 ? '…' : '') + s.text.slice(Math.max(0, at - 40), at + 100) + '…'
      return { ...s, snippet, score: words.filter(w => title.includes(w)).length * 10 - s.depth }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
}

export default function Search({ open, onClose }) {
  const dialog = useRef(null)
  const [q, setQ] = useState('')
  const results = useMemo(() => find(q), [q])

  useEffect(() => {
    const d = dialog.current
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const go = id => {
    onClose()
    setQ('')
    document.getElementById(id)?.scrollIntoView()
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <dialog ref={dialog} className="search" onClose={onClose} onClick={e => e.target === dialog.current && onClose()} aria-label="Search the guide">
      <form method="dialog" onSubmit={e => { if (results[0]) { e.preventDefault(); go(results[0].id) } }}>
        <input
          autoFocus type="search" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search: Dark Void, Sturdy, Iron Hands…" aria-label="Search"
        />
      </form>
      {q ? (
        <ul className="search-results">
          {results.length === 0 && <li className="search-none">Nothing found for “{q}”.</li>}
          {results.map(r => (
            <li key={r.id}>
              <button type="button" onClick={() => go(r.id)}>
                <span className="search-title">{r.title}</span>
                <span className="search-where">{r.chapter}</span>
                <span className="search-snippet">{r.snippet}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="search-results">
          {chapters.map(c => (
            <li key={c.id}>
              <button type="button" onClick={() => go(c.id)}>
                <span className="search-title">{c.title}</span>
                <span className="search-snippet">{c.lead}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  )
}
