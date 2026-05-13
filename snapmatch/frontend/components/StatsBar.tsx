'use client'
import { useEffect, useState } from 'react'
import { getStats, type Stats } from '@/lib/api'

interface Props { eventId: number }

const ITEMS: { key: keyof Stats; label: string; color: string }[] = [
  { key: 'photos',    label: 'Photos',    color: '#7c6fff' },
  { key: 'faces',     label: 'Faces',     color: '#a99fff' },
  { key: 'matched',   label: 'Matched',   color: '#f8a84b' },
  { key: 'delivered', label: 'Delivered', color: '#22d97e' },
]

export default function StatsBar({ eventId }: Props) {
  const [stats, setStats] = useState<Stats>({ photos: 0, faces: 0, matched: 0, delivered: 0 })

  useEffect(() => {
    let alive = true
    async function tick() {
      try {
        const s = await getStats(eventId)
        if (alive) setStats(s)
      } catch { /* silent */ }
    }
    tick()
    const id = setInterval(tick, 5000)
    return () => { alive = false; clearInterval(id) }
  }, [eventId])

  return (
    <div className="grid grid-cols-2 gap-px bg-border border border-border rounded-sm overflow-hidden">
      {ITEMS.map(item => (
        <div key={item.key} className="bg-card px-4 py-3">
          <div className="font-display font-bold text-xl leading-none" style={{ color: item.color }}>
            {stats[item.key]}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
