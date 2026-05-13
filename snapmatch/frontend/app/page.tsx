'use client'
import Link from 'next/link'

const STEPS = [
  {
    n: '01', icon: '↑', label: 'Upload',
    desc: 'Drag your event photos — JPEG, PNG, any size. Batch upload in seconds.',
    color: '#7c6fff',
  },
  {
    n: '02', icon: '◎', label: 'Detect',
    desc: 'AI scans every photo, finds every face, and clusters identities automatically.',
    color: '#a99fff',
  },
  {
    n: '03', icon: '◈', label: 'Match',
    desc: 'One click to assign a LINE ID to each face cluster. No manual sorting.',
    color: '#f8a84b',
  },
  {
    n: '04', icon: '↗', label: 'Deliver',
    desc: "Guests receive their photos on LINE within seconds. You're done.",
    color: '#22d97e',
  },
]

const FEATURES = [
  {
    title: 'Built for shooters, not engineers',
    body: 'Upload → assign → send. The face pipeline runs in the background. Zero config, zero sorting, zero email chains.',
    accent: '#7c6fff',
    tag: 'Workflow',
  },
  {
    title: 'dlib-grade face recognition',
    body: '128-dimension face embeddings. DBSCAN clustering handles hundreds of guests across thousands of photos with sub-0.5 tolerance.',
    accent: '#f8a84b',
    tag: 'AI',
  },
  {
    title: 'LINE delivery guests already have',
    body: "Push photos directly to each guest's LINE inbox. No app install, no link sharing, no downloads — it just arrives.",
    accent: '#22d97e',
    tag: 'Delivery',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-base text-[#d4d8ef] grid-bg overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border bg-base/80 backdrop-blur-md">
        <span className="font-display font-extrabold text-lg tracking-tight">
          snap<span className="text-primary">match</span>
        </span>
        <div className="flex items-center gap-6">
          <Link href="#how" className="text-sm text-muted hover:text-[#d4d8ef] transition-colors">How it works</Link>
          <Link href="#features" className="text-sm text-muted hover:text-[#d4d8ef] transition-colors">Features</Link>
          <Link
            href="/events/new"
            className="bg-primary hover:bg-primary-l text-white text-sm font-semibold px-5 py-2 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(124,111,255,0.45)]"
          >
            New Event →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 px-8 max-w-7xl mx-auto">
        {/* ambient glow */}
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[800px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(124,111,255,0.1) 0%, transparent 65%)' }}
        />

        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 border border-primary/25 bg-primary/5 px-3 py-1.5 rounded-sm text-xs font-mono text-primary mb-10 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            AI face recognition · LINE push delivery · No account required
          </div>

          <h1 className="font-display font-extrabold leading-[0.92] tracking-tight mb-8 fade-up-1" style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}>
            Every guest<br />
            gets their<br />
            <span className="shimmer-text">moments.</span>
          </h1>

          <p className="text-lg text-muted max-w-xl leading-relaxed mb-12 fade-up-2">
            Upload event photos. AI finds every face. Guests receive their photos on LINE —
            automatically. No sorting. No sharing links. No headaches.
          </p>

          <div className="flex flex-wrap items-center gap-4 fade-up-3">
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-l text-white font-semibold px-8 py-4 rounded-sm transition-all hover:shadow-[0_0_40px_rgba(124,111,255,0.5)] active:scale-[0.98]"
            >
              Start Free Event
              <span className="text-primary-l">→</span>
            </Link>
            <span className="text-sm text-dim">No credit card · Free for your first event</span>
          </div>
        </div>

        {/* mock stat ticker */}
        <div className="mt-20 grid grid-cols-3 gap-px border border-border fade-up-4 max-w-xl">
          {[
            { n: '< 2 min', label: 'Setup time' },
            { n: '128-d', label: 'Face embeddings' },
            { n: '1 click', label: 'Per guest delivery' },
          ].map(s => (
            <div key={s.label} className="bg-surface px-6 py-4">
              <div className="font-display font-bold text-2xl text-primary">{s.n}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-8 max-w-7xl mx-auto border-t border-border">
        <p className="font-mono text-xs text-muted uppercase tracking-[0.2em] mb-12">How it works</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative bg-surface p-7 group hover:bg-card-hi transition-colors">
              <div className="font-mono text-[10px] text-dim mb-6">{step.n}</div>
              <div className="text-3xl font-display font-bold mb-4" style={{ color: step.color }}>
                {step.icon}
              </div>
              <h3 className="font-display font-bold text-base mb-2">{step.label}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-px bg-border z-10" />
              )}
            </div>
          ))}
        </div>

        {/* LINE callout */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-muted">Delivers via</span>
          <span className="bg-[#06C755] text-white text-xs font-bold px-2.5 py-1 rounded font-mono tracking-wide">
            LINE
          </span>
          <span className="text-sm text-muted">— the app 95M+ users in Asia already open daily</span>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto border-t border-border">
        <p className="font-mono text-xs text-muted uppercase tracking-[0.2em] mb-12">Why SnapMatch</p>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-surface p-8 group hover:bg-card-hi transition-colors">
              <div className="flex items-center justify-between mb-8">
                <div className="h-0.5 w-10" style={{ background: f.accent }} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-dim border border-dim px-2 py-0.5 rounded-sm">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg mb-3 leading-snug">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-8 text-center border-t border-border">
        <p className="font-mono text-xs text-muted uppercase tracking-[0.2em] mb-8">Get started</p>
        <h2 className="font-display font-extrabold text-[clamp(32px,5vw,64px)] leading-tight mb-4">
          Ship your first<br />event in minutes.
        </h2>
        <p className="text-muted text-sm mb-10">No account. No credit card. Just upload, detect, and deliver.</p>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-l text-white font-semibold px-10 py-4 rounded-sm transition-all hover:shadow-[0_0_50px_rgba(124,111,255,0.5)]"
        >
          Create Event →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-8 border-t border-border flex items-center justify-between">
        <span className="font-display font-extrabold text-sm text-muted">
          snap<span className="text-primary">match</span>
        </span>
        <span className="text-xs text-dim font-mono">FastAPI · face_recognition · LINE API · Next.js 14</span>
      </footer>
    </main>
  )
}
