'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEvent } from '@/lib/api'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      const event = await createEvent({
        name:               (fd.get('name') as string).trim(),
        date:               fd.get('date') as string,
        line_channel_token: (fd.get('line_channel_token') as string) || undefined,
      })
      router.push(`/events/${event.id}`)
    } catch {
      setError('Could not reach the API. Make sure the backend is running.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-base text-[#d4d8ef] grid-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/" className="font-display font-extrabold text-lg">
          snap<span className="text-primary">match</span>
        </Link>
        <span className="font-mono text-xs text-muted">New Event</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md fade-up">
          {/* header */}
          <div className="mb-10">
            <p className="font-mono text-xs text-primary uppercase tracking-[0.2em] mb-3">Step 1 of 1</p>
            <h1 className="font-display font-extrabold text-4xl leading-tight mb-2">
              Create your event
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              Give it a name and date. Add your LINE channel token to enable delivery,
              or leave blank to test the face detection flow first.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event name */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-2">
                Event Name
              </label>
              <input
                name="name"
                type="text"
                required
                autoFocus
                placeholder="e.g. Johnson Wedding · June 2025"
                className="w-full bg-surface border border-border focus:border-primary text-[#d4d8ef] placeholder-dim px-4 py-3 rounded-sm outline-none transition-colors text-sm"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-2">
                Event Date
              </label>
              <input
                name="date"
                type="date"
                required
                className="w-full bg-surface border border-border focus:border-primary text-[#d4d8ef] px-4 py-3 rounded-sm outline-none transition-colors text-sm [color-scheme:dark]"
              />
            </div>

            {/* LINE token */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted mb-2">
                LINE Channel Access Token{' '}
                <span className="normal-case font-sans text-dim">(optional)</span>
              </label>
              <input
                name="line_channel_token"
                type="password"
                placeholder="Paste Messaging API channel token…"
                className="w-full bg-surface border border-border focus:border-primary text-[#d4d8ef] placeholder-dim px-4 py-3 rounded-sm outline-none transition-colors text-sm font-mono"
              />
              <p className="mt-2 text-[11px] text-dim leading-snug">
                Stored per-event. Get yours from{' '}
                <span className="text-primary font-mono">developers.line.biz</span>
                {' '}→ Messaging API settings.
              </p>
            </div>

            {error && (
              <div className="border border-danger/30 bg-danger/5 text-danger text-sm px-4 py-3 rounded-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-l disabled:opacity-40 text-white font-semibold py-4 rounded-sm transition-all hover:shadow-[0_0_30px_rgba(124,111,255,0.45)] active:scale-[0.99] text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating event…
                </span>
              ) : (
                'Create Event →'
              )}
            </button>
          </form>

          {/* hint */}
          <p className="mt-8 text-center text-xs text-dim">
            After creating, you&apos;ll land in the photographer dashboard to upload photos.
          </p>
        </div>
      </div>
    </main>
  )
}
