'use client'
import Link from 'next/link'
import { useState } from 'react'

const MOCK_EVENTS = [
  { id: 1, name: 'Summer Festival 2025', date: '2025-07-12', photos: 342, guests: 87, delivered: 74, status: 'done' },
  { id: 2, name: 'Wedding – Kim & Pat', date: '2025-06-28', photos: 891, guests: 124, delivered: 119, status: 'done' },
  { id: 3, name: 'Corporate Gala Q2', date: '2025-05-18', photos: 157, guests: 43, delivered: 31, status: 'scanning' },
  { id: 4, name: 'Graduation Ceremony', date: '2025-04-05', photos: 0, guests: 0, delivered: 0, status: 'pending' },
]

const STATS = [
  { label: 'Total Events', value: '4' },
  { label: 'Photos Indexed', value: '1,390' },
  { label: 'Faces Found', value: '254' },
  { label: 'Photos Delivered', value: '224' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    done:     { label: 'Delivered', cls: 'badge-done' },
    scanning: { label: 'Scanning', cls: 'badge-scanning' },
    pending:  { label: 'Pending', cls: 'badge-pending' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`font-mono text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-sm ${s.cls}`}>
      {s.label}
    </span>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'deliver'>('events')

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(7,7,7,0.9)' }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md">
        <Link href="/" className="font-display text-2xl tracking-widest gold-text">GRIZZZ</Link>
        <div className="flex items-center gap-3">
          <Link href="/find" className="btn-ghost text-sm font-semibold px-4 py-2 rounded-sm">
            Find Photos
          </Link>
          <Link href="/events/new" className="btn-gold text-sm font-semibold px-5 py-2 rounded-sm">
            + New Event
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10 fade-in">
          <p className="font-mono text-xs tracking-[0.25em] mb-2" style={{ color: 'var(--muted)' }}>
            PHOTOGRAPHER DASHBOARD
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1 }}>
            YOUR EVENTS
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-10 fade-in-1" style={{ background: 'var(--border)' }}>
          {STATS.map(s => (
            <div key={s.label} className="p-5" style={{ background: 'var(--card)' }}>
              <div className="font-display text-3xl mb-1" style={{ color: 'var(--gold)' }}>{s.value}</div>
              <div className="font-mono text-[10px] tracking-wider" style={{ color: 'var(--dim)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mb-6 border-b fade-in-2" style={{ borderColor: 'var(--border)' }}>
          {(['events', 'deliver'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-semibold capitalize relative transition-colors"
              style={{ color: activeTab === tab ? 'var(--gold)' : 'var(--muted)' }}>
              {tab === 'events' ? 'All Events' : 'LINE Delivery'}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--gold)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Events table */}
        {activeTab === 'events' && (
          <div className="fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Event', 'Date', 'Photos', 'Guests', 'Delivered', 'Status', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-mono text-[10px] tracking-[0.15em]"
                        style={{ color: 'var(--dim)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_EVENTS.map(ev => (
                    <tr key={ev.id} className="group"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="py-4 px-4 font-semibold">{ev.name}</td>
                      <td className="py-4 px-4 font-mono text-xs" style={{ color: 'var(--muted)' }}>{ev.date}</td>
                      <td className="py-4 px-4" style={{ color: 'var(--muted)' }}>{ev.photos.toLocaleString()}</td>
                      <td className="py-4 px-4" style={{ color: 'var(--muted)' }}>{ev.guests}</td>
                      <td className="py-4 px-4">
                        {ev.guests > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="progress-track h-1 w-16">
                              <div className="progress-fill" style={{ width: `${Math.round((ev.delivered / ev.guests) * 100)}%` }} />
                            </div>
                            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                              {ev.delivered}/{ev.guests}
                            </span>
                          </div>
                        ) : <span style={{ color: 'var(--dim)' }}>—</span>}
                      </td>
                      <td className="py-4 px-4"><StatusBadge status={ev.status} /></td>
                      <td className="py-4 px-4">
                        <Link href={`/events/${ev.id}`}
                          className="btn-ghost text-xs px-3 py-1.5 rounded-sm font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <Link href="/events/new" className="btn-gold px-6 py-2.5 rounded-sm text-sm font-semibold inline-flex items-center gap-2">
                + Create New Event
              </Link>
            </div>
          </div>
        )}

        {/* LINE delivery tab */}
        {activeTab === 'deliver' && (
          <div className="fade-in space-y-4">
            {/* banner */}
            <div className="p-5 rounded-sm flex items-center justify-between"
              style={{ border: '1px solid rgba(6,199,85,0.2)', background: 'rgba(6,199,85,0.05)' }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded" style={{ background: '#06C755', color: '#fff' }}>
                  LINE
                </span>
                <div>
                  <p className="font-semibold text-sm">LINE Bot connected</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Guests can send selfies to @grizzz_bot to receive their photos automatically
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-sm badge-done">Active</span>
            </div>

            {MOCK_EVENTS.filter(e => e.guests > 0).map(ev => (
              <div key={ev.id} className="p-5 rounded-sm card-glow"
                style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{ev.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{ev.date}</p>
                  </div>
                  <StatusBadge status={ev.status} />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Guests: </span>
                    <span className="font-semibold">{ev.guests}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)' }}>Delivered: </span>
                    <span className="font-semibold" style={{ color: 'var(--green)' }}>{ev.delivered}</span>
                  </div>
                  <div className="flex-1">
                    <div className="progress-track h-1">
                      <div className="progress-fill" style={{ width: `${Math.round((ev.delivered / ev.guests) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>
                    {Math.round((ev.delivered / ev.guests) * 100)}%
                  </span>
                </div>
                {ev.status !== 'done' && (
                  <button className="mt-4 btn-gold text-xs px-4 py-2 rounded-sm font-semibold">
                    Send Remaining →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
