'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getEvent, type Event } from '@/lib/api'

export default function RegisterPage() {
  const { event_id } = useParams<{ event_id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  const lineDeepLink = process.env.NEXT_PUBLIC_LINE_BOT_BASIC_ID
    ? `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_BASIC_ID}`
    : 'https://line.me/'

  useEffect(() => {
    getEvent(parseInt(event_id, 10))
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [event_id])

  const selfUrl     = typeof window !== 'undefined' ? window.location.href : ''
  const qrUrl       = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(lineDeepLink)}&color=06C755&bgcolor=08090d&margin=16`

  const STEPS = [
    { n: '1', icon: '＋', text: 'Add our LINE bot by scanning the QR or tapping the button.' },
    { n: '2', icon: '🤳', text: 'Send us a selfie as your first message.' },
    { n: '3', icon: '📸', text: "We'll match your face to every photo from the event and send them to you." },
  ]

  return (
    <main className="min-h-screen bg-base text-[#d4d8ef] grid-bg flex flex-col">
      {/* nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <Link href="/" className="font-display font-extrabold text-base">
          snap<span className="text-primary">match</span>
        </Link>
        <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Guest Portal</span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* ambient */}
        <div
          aria-hidden
          className="absolute pointer-events-none w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #06C755 0%, transparent 70%)' }}
        />

        <div className="relative w-full max-w-md">
          <div className="fade-up mb-2">
            <span className="inline-block bg-[#06C755]/10 border border-[#06C755]/30 text-[#06C755] font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm">
              LINE Photo Delivery
            </span>
          </div>

          <h1 className="font-display font-extrabold text-[clamp(28px,5vw,48px)] leading-tight mt-4 mb-2 fade-up-1">
            Find your photos<br />
            from{' '}
            <span className="text-[#06C755]">
              {loading ? '…' : (event?.name ?? 'this event')}
            </span>
          </h1>

          <p className="text-sm text-muted mb-10 fade-up-2">
            Add our LINE bot, send a selfie, and we&apos;ll deliver every photo of you directly to your LINE inbox — free.
          </p>

          {/* QR + CTA */}
          <div className="bg-card border border-border rounded-sm p-6 mb-8 fade-up-3">
            <div className="flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="LINE bot QR code"
                className="w-40 h-40 rounded-sm"
              />
              <p className="font-mono text-[10px] text-muted uppercase tracking-wider">
                Scan with LINE app camera
              </p>
              <div className="w-full border-t border-border my-1" />
              <a
                href={lineDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04a] text-white font-bold py-3 rounded-sm transition-colors text-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.03 2 11c0 3.01 1.57 5.66 3.97 7.4L5 21l2.75-1.24A10.5 10.5 0 0 0 12 20c5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
                </svg>
                Open in LINE
              </a>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 text-left fade-up-4">
            {STEPS.map(s => (
              <div key={s.n} className="flex items-start gap-4 bg-card border border-border px-4 py-3 rounded-sm">
                <div className="shrink-0 w-7 h-7 rounded-sm bg-primary/15 border border-primary/25 flex items-center justify-center font-mono text-xs text-primary font-bold">
                  {s.n}
                </div>
                <p className="text-sm text-muted leading-relaxed pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <p className="mt-8 text-[10px] text-dim text-center leading-relaxed">
            Your selfie is only used to match your face within this event.
            Photos are never sold or shared with third parties.
          </p>
        </div>
      </div>
    </main>
  )
}
