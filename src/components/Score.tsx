import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Renders ABC notation as a grand staff. Notes are tagged with their bar so the playing bar can be lit.
 *  abcjs is loaded on demand, so it stays out of the main bundle. */
export function Score({ abc, bar, className }: { abc: string; bar: number; className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width / 20) * 20))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el || !width) return
    let cancelled = false
    void import('abcjs').then(({ default: abcjs }) => {
      if (cancelled) return
      const narrow = width < 560
      abcjs.renderAbc(el, abc, {
        add_classes: true,
        staffwidth: width - 12,
        paddingleft: 0,
        paddingright: 0,
        paddingtop: 4,
        paddingbottom: 4,
        scale: narrow ? 0.9 : 1,
        wrap: { minSpacing: 1.6, maxSpacing: 2.6, preferredMeasuresPerLine: narrow ? 2 : 4 },
      })
      tagBars(el)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [abc, width])

  useEffect(() => {
    const el = host.current
    if (!el) return
    el.toggleAttribute('data-playing', bar >= 0)
    el.querySelectorAll('.is-current').forEach((n) => n.classList.remove('is-current'))
    if (bar >= 0) el.querySelectorAll(`[data-bar="${bar}"]`).forEach((n) => n.classList.add('is-current'))
  }, [bar, ready, abc, width])

  return <div ref={host} className={cn('score min-h-40 w-full', className)} />
}

/** abcjs numbers bars per line (`abcjs-l2 abcjs-m1`); convert that to a bar index across the piece. */
function tagBars(el: HTMLElement) {
  const items = [...el.querySelectorAll<SVGElement>('.abcjs-note, .abcjs-rest, .abcjs-chord, .abcjs-annotation')]
  const pos = (n: SVGElement) => {
    const cls = n.getAttribute('class') ?? ''
    const l = /abcjs-l(\d+)/.exec(cls)
    const m = /abcjs-m(\d+)/.exec(cls)
    return l && m ? [Number(l[1]), Number(m[1])] : null
  }
  const perLine: number[] = []
  for (const n of items) {
    const p = pos(n)
    if (p) perLine[p[0]] = Math.max(perLine[p[0]] ?? 0, p[1] + 1)
  }
  const offset = perLine.map((_, i) => perLine.slice(0, i).reduce((a, b) => a + (b ?? 0), 0))
  for (const n of items) {
    const p = pos(n)
    if (p) n.setAttribute('data-bar', String(offset[p[0]] + p[1]))
  }
}
