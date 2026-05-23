'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const STEPS = [
  {
    n: '01',
    label: 'Upload',
    desc: 'Drop your full event gallery — JPEG, PNG, RAW. Hundreds of photos in seconds.',
    accent: '#F5A623',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0L8 12m4-4v12"/>
      </svg>
    ),
  },
  {
    n: '02',
    label: 'Detect',
    desc: 'AI scans every photo. 128-d embeddings find every face, every angle, every crowd.',
    accent: '#00D4C8',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/><path d="M3 9V6a2 2 0 012-2h3M3 15v3a2 2 0 002 2h3M21 9V6a2 2 0 00-2-2h-3M21 15v3a2 2 0 01-2 2h-3"/>
      </svg>
    ),
  },
  {
    n: '03',
    label: 'Match',
    desc: 'Guest sends a selfie via LINE. Grizzz finds their face across your entire gallery.',
    accent: '#FF4D00',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
  },
  {
    n: '04',
    label: 'Deliver',
    desc: "Photos land in the guest's LINE inbox instantly. Done. No apps, no links.",
    accent: '#22D97E',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
      </svg>
    ),
  },
]

const FEATURES = [
  {
    tag: 'AI CORE',
    title: 'dlib-grade recognition',
    body: '128-dimension face embeddings with DBSCAN clustering. Sub-0.5 tolerance handles twins, bad lighting, crowd shots — all automatic.',
    accent: '#F5A623',
  },
  {
    tag: 'DELIVERY',
    title: 'LINE-native push',
    body: "Photos arrive in each guest's LINE inbox — the app 95M+ users in Asia already open every day. Zero friction. Zero installs.",
    accent: '#00D4C8',
  },
  {
    tag: 'ACCESS',
    title: 'Zero barriers',
    body: 'No accounts. No passwords. No subscriptions. Photographers upload, guests find their photos. That\'s the whole product.',
    accent: '#22D97E',
  },
]

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 40)
    const t = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(t) }
      else setVal(start)
    }, 35)
    return () => clearInterval(t)
  }, [target])
  return <>{val}{suffix}</>
}

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }} className="overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(7,7,7,0.85)' }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md">
        <Link href="/" className="font-display text-2xl tracking-widest gold-text">GRIZZZ</Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#how" className="text-sm font-medium" style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            How it works
          </Link>
          <Link href="#features" className="text-sm font-medium" style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            Features
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/find" className="btn-ghost text-sm font-semibold px-4 py-2 rounded-sm">
            Find My Photos
          </Link>
          <Link href="/events/new" className="btn-gold text-sm font-semibold px-5 py-2 rounded-sm">
            Upload Event →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 px-6 md:px-16 dot-grid claw-marks overflow-hidden">

        {/* ambient blobs */}
        <div aria-hidden className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(245,166,35,0.07) 0%, transparent 60%)' }} />
        <div aria-hidden className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(0,212,200,0.05) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          {/* badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-sm font-mono text-xs fade-in"
            style={{ border: '1px solid rgba(245,166,35,0.2)', background: 'rgba(245,166,35,0.05)', color: 'var(--gold)' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-ring" style={{ background: 'var(--gold)' }} />
            AI Face Detection · LINE Delivery · No Login Required
          </div>

          {/* headline */}
          <div className="fade-in-1">
            <p className="font-mono text-xs tracking-[0.3em] mb-3" style={{ color: 'var(--muted)' }}>
              GRIZZZ PHOTO INTELLIGENCE
            </p>
            <h1 className="font-display leading-none mb-0" style={{ fontSize: 'clamp(72px, 14vw, 180px)' }}>
              FIND YOUR
            </h1>
            <h1 className="font-display leading-none gold-text scan-beam"
              style={{ fontSize: 'clamp(72px, 14vw, 180px)' }}>
              MOMENTS
            </h1>
            <h1 className="font-display leading-none" style={{ fontSize: 'clamp(72px, 14vw, 180px)', color: 'var(--dim)' }}>
              INSTANTLY
            </h1>
          </div>

          {/* sub */}
          <p className="max-w-lg text-base leading-relaxed mt-8 mb-10 fade-in-2"
            style={{ color: 'var(--muted)', fontWeight: 300 }}>
            Photographers upload the gallery. Guests send a selfie on LINE.
            Grizzz finds every photo of them — automatically. No sorting, no sharing links.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16 fade-in-3">
            <Link href="/events/new"
              className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-sm text-sm font-semibold">
              Upload Event Photos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/find"
              className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 rounded-sm text-sm font-semibold">
              Find My Photos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </Link>
          </div>

          {/* stats */}
          <div className="grid grid-cols-3 max-w-md fade-in-4">
            {[
              { target: 128, suffix: '-d', label: 'Face embeddings' },
              { target: 2, suffix: ' min', label: 'Setup time' },
              { target: 1, suffix: ' tap', label: 'Guest delivery' },
            ].map(s => (
              <div key={s.label} className="border-l first:border-l-0 py-3 pl-6 first:pl-0"
                style={{ borderColor: 'var(--border)' }}>
                <div className="font-display text-3xl" style={{ color: 'var(--gold)' }}>
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="font-mono text-[10px] tracking-wider mt-0.5" style={{ color: 'var(--dim)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* diagonal rule */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section id="how" className="py-28 px-6 md:px-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline gap-6 mb-16">
            <span className="font-mono text-xs tracking-[0.25em]" style={{ color: 'var(--muted)' }}>
              HOW IT WORKS
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <div className="grid md:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
            {STEPS.map((step) => (
              <div key={step.n} className="card-glow p-8 relative"
                style={{ background: 'var(--card)', border: '1px solid transparent' }}>
                {/* step number */}
                <div className="font-display text-6xl leading-none mb-6 opacity-10"
                  style={{ color: step.accent }}>
                  {step.n}
                </div>
                {/* icon */}
                <div className="mb-5" style={{ color: step.accent }}>
                  {step.icon}
                </div>
                {/* label */}
                <h3 className="font-display text-2xl mb-3">{step.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {step.desc}
                </p>
                {/* accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: step.accent }} />
              </div>
            ))}
          </div>

          {/* LINE badge */}
          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Guests receive photos via</span>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded"
              style={{ background: '#06C755', color: '#fff', letterSpacing: '0.1em' }}>
              LINE
            </span>
            <span className="text-sm" style={{ color: 'var(--dim)' }}>— 95M+ daily users across Asia</span>
          </div>
        </div>
      </section>

      {/* ── Zero login callout ───────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-16 overflow-hidden relative"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(245,166,35,0.05) 0%, transparent 65%)' }} />
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <p className="font-mono text-xs tracking-[0.25em] mb-3" style={{ color: 'var(--muted)' }}>
              ACCESS POLICY
            </p>
            <h2 className="font-display leading-none" style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}>
              NO LOGIN.
            </h2>
            <h2 className="font-display leading-none gold-text" style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}>
              NO WALLS.
            </h2>
            <h2 className="font-display leading-none" style={{ fontSize: 'clamp(40px, 6vw, 80px)', color: 'var(--dim)' }}>
              NO FRICTION.
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="leading-relaxed mb-6" style={{ color: 'var(--muted)', fontWeight: 300 }}>
              Grizzz has zero authentication walls. Upload photos, manage events, deliver to guests —
              everything is instantly accessible. Every feature. All permissions.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['Dashboard', 'Upload', 'Face Detect', 'LINE Deliver', 'Events', 'Find Photos'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--green)' }}>✓</span>
                  <span style={{ color: 'var(--muted)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 md:px-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline gap-6 mb-16">
            <span className="font-mono text-xs tracking-[0.25em]" style={{ color: 'var(--muted)' }}>
              WHY GRIZZZ
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {FEATURES.map(f => (
              <div key={f.tag} className="card-glow p-8" style={{ background: 'var(--card)', border: '1px solid transparent' }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="h-px w-10" style={{ background: f.accent }} />
                  <span className="font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 rounded-sm"
                    style={{ border: `1px solid ${f.accent}30`, color: f.accent }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-display text-2xl mb-4">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center relative overflow-hidden"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div aria-hidden className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(245,166,35,0.06) 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-[0.25em] mb-6" style={{ color: 'var(--muted)' }}>GET STARTED NOW</p>
          <h2 className="font-display leading-none mb-4" style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}>
            YOUR FIRST
          </h2>
          <h2 className="font-display leading-none gold-text mb-8" style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}>
            EVENT FREE
          </h2>
          <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>
            No account. No credit card. Upload, detect, and deliver in under 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/events/new" className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded-sm font-semibold">
              Start Uploading →
            </Link>
            <Link href="/find" className="btn-ghost inline-flex items-center gap-2 px-10 py-4 rounded-sm font-semibold">
              Find My Photos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="py-6 px-6 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ borderTop: '1px solid var(--border)' }}>
        <Link href="/" className="font-display text-xl tracking-widest gold-text">GRIZZZ</Link>
        <span className="font-mono text-xs" style={{ color: 'var(--dim)' }}>
          FastAPI · face_recognition · DBSCAN · LINE API · Next.js 14
        </span>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>Dashboard</Link>
          <Link href="/find" className="text-xs hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>Find Photos</Link>
          <Link href="/events/new" className="text-xs hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>Upload</Link>
        </div>
      </footer>
    </main>
  )
}
