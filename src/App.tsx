import { useEffect, useRef, useState } from 'react'
import { Music } from 'lucide-react'
import { Dock } from '@/components/Dock'
import { cn } from '@/lib/utils'
import { Repertoire } from '@/repertoire'
import { Guide, Hero, SECTIONS } from '@/sections'

/** The nine numbered steps, then the repertoire. */
const NAV = [...SECTIONS, { id: 'repertoire', title: 'Repertoire' }]

function Marker({ i }: { i: number }) {
  return i < SECTIONS.length ? <>{i + 1}</> : <Music className="size-3.5" aria-hidden />
}

function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    NAV.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  return active
}

/** Phone and tablet: a sticky strip of step numbers. */
function TopNav({ active }: { active: string }) {
  const current = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    current.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [active])
  return (
    <nav
      aria-label="Steps"
      className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur lg:hidden"
    >
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 py-2">
        {NAV.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            ref={active === s.id ? current : undefined}
            aria-current={active === s.id ? 'step' : undefined}
            className={cn(
              'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap',
              active === s.id ? 'bg-pine text-white' : 'text-muted-foreground',
            )}
          >
            <span className={cn('font-heading font-bold', active === s.id && 'text-mel')}>
              <Marker i={i} />
            </span>
            {s.title}
          </a>
        ))}
      </div>
    </nav>
  )
}

/** Desktop: the nine steps down the left edge. */
function SideNav({ active }: { active: string }) {
  return (
    <nav aria-label="Steps" className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col pt-20 pb-44 lg:flex">
      <a href="#top" className="mb-6 font-heading text-lg leading-tight font-extrabold">
        Pop Piano
        <br />
        by Ear
      </a>
      <ol className="space-y-0.5">
        {NAV.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'step' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                active === s.id ? 'bg-pine font-semibold text-white' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className={cn('w-3 font-heading font-bold', active === s.id && 'text-mel')}>
                <Marker i={i} />
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function App() {
  const active = useActiveSection()
  return (
    <div id="top">
      <TopNav active={active} />
      <div className="mx-auto flex max-w-6xl gap-12 px-4 sm:px-6">
        <SideNav active={active} />
        <main className="min-w-0 flex-1 pb-48">
          <Hero />
          <Guide />
          <Repertoire />
          <footer className="border-t border-border py-8 text-sm text-muted-foreground">
            All audio is generated in your browser. The practice tune and accompaniments are original; repertoire
            melodies are original or in the public domain. Other song titles are suggestions for practice only.
          </footer>
        </main>
      </div>
      <Dock />
    </div>
  )
}
