'use client'
import Link from 'next/link'
import { useState, useRef } from 'react'

type Stage = 'idle' | 'uploading' | 'scanning' | 'done' | 'error'

const MOCK_PHOTOS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80', event: 'Summer Festival 2025' },
  { id: 2, src: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80', event: 'Summer Festival 2025' },
  { id: 3, src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80', event: 'Summer Festival 2025' },
  { id: 4, src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', event: 'Summer Festival 2025' },
  { id: 5, src: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&q=80', event: 'Summer Festival 2025' },
  { id: 6, src: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', event: 'Summer Festival 2025' },
]

export default function FindPage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setStage('uploading')
    setProgress(0)

    // simulate upload
    let p = 0
    const t1 = setInterval(() => {
      p += 8
      setProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(t1)
        setStage('scanning')
        setProgress(0)
        // simulate scan
        let q = 0
        const t2 = setInterval(() => {
          q += 3
          setProgress(Math.min(q, 100))
          if (q >= 100) { clearInterval(t2); setStage('done') }
        }, 60)
      }
    }, 60)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function reset() {
    setStage('idle')
    setPreview(null)
    setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', background: 'rgba(7,7,7,0.9)' }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md">
        <Link href="/" className="font-display text-2xl tracking-widest gold-text">GRIZZZ</Link>
        <Link href="/events/new" className="btn-gold text-sm font-semibold px-5 py-2 rounded-sm">
          Upload Event →
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-12 fade-in">
          <p className="font-mono text-xs tracking-[0.25em] mb-3" style={{ color: 'var(--muted)' }}>
            GUEST PORTAL
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            FIND YOUR
          </h1>
          <h1 className="font-display leading-none gold-text" style={{ fontSize: 'clamp(48px, 8vw, 88px)' }}>
            PHOTOS
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--muted)', fontWeight: 300 }}>
            Upload a clear selfie. Grizzz finds every photo of you from the event in seconds.
          </p>
        </div>

        {/* Upload zone */}
        {stage === 'idle' && (
          <div
            className={`upload-zone rounded-sm p-16 text-center cursor-pointer fade-in-1 ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                  style={{ color: 'var(--gold)' }}>
                  <path d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-base mb-1">Drop your selfie here</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>or click to browse · JPEG, PNG · any size</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-sm"
                style={{ border: '1px solid rgba(245,166,35,0.2)', color: 'var(--gold)', background: 'rgba(245,166,35,0.04)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                No account required
              </div>
            </div>
          </div>
        )}

        {/* Processing state */}
        {(stage === 'uploading' || stage === 'scanning') && (
          <div className="fade-in" style={{ border: '1px solid var(--border)', background: 'var(--card)', borderRadius: 2, padding: 32 }}>
            <div className="flex items-start gap-6 mb-8">
              {preview && (
                <img src={preview} alt="selfie" className="w-20 h-20 object-cover rounded"
                  style={{ border: '1px solid var(--border)' }} />
              )}
              <div className="flex-1">
                <p className="font-semibold mb-1">
                  {stage === 'uploading' ? 'Uploading selfie...' : 'Scanning faces...'}
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {stage === 'uploading' ? 'Preparing your image for analysis' : 'Comparing your face across the event gallery'}
                </p>
              </div>
            </div>
            <div className="progress-track h-1 mb-2">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {stage === 'uploading' ? 'Upload' : 'Face scan'}
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>{progress}%</span>
            </div>
          </div>
        )}

        {/* Results */}
        {stage === 'done' && (
          <div className="fade-in">
            {/* summary bar */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-sm"
              style={{ border: '1px solid rgba(34,217,126,0.2)', background: 'rgba(34,217,126,0.05)' }}>
              <div className="flex items-center gap-3">
                {preview && <img src={preview} alt="selfie" className="w-10 h-10 object-cover rounded-full border"
                  style={{ borderColor: 'var(--green)' }} />}
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>
                    {MOCK_PHOTOS.length} photos found
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Summer Festival 2025</p>
                </div>
              </div>
              <button onClick={reset} className="btn-ghost text-xs px-3 py-1.5 rounded-sm font-semibold">
                Search Again
              </button>
            </div>

            {/* grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
              {MOCK_PHOTOS.map((p, i) => (
                <div key={p.id} className="relative group overflow-hidden rounded-sm card-glow"
                  style={{ border: '1px solid transparent', aspectRatio: '4/3' }}>
                  <img src={p.src} alt={`Match ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}>
                    <a href={p.src} download className="btn-gold text-xs px-3 py-1.5 rounded-sm font-semibold">
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* download all */}
            <button className="btn-gold w-full py-3.5 rounded-sm font-semibold flex items-center justify-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download All {MOCK_PHOTOS.length} Photos
            </button>
          </div>
        )}

        {/* Tips */}
        {stage === 'idle' && (
          <div className="mt-10 grid grid-cols-3 gap-3 fade-in-2">
            {[
              { icon: '☀️', tip: 'Good lighting', sub: 'Face clearly visible' },
              { icon: '👤', tip: 'Solo selfie', sub: 'Just you in frame' },
              { icon: '📐', tip: 'Straight angle', sub: 'Camera at eye level' },
            ].map(t => (
              <div key={t.tip} className="p-4 rounded-sm text-center"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="text-xl mb-2">{t.icon}</div>
                <p className="text-xs font-semibold mb-0.5">{t.tip}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
