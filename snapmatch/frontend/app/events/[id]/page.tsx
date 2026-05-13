'use client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getEvent, getClusters, getDeliveryStatus, deliverAll,
  type Event, type Cluster, type DeliveryStatus, type UploadedPhoto,
} from '@/lib/api'
import StatsBar from '@/components/StatsBar'
import UploadDropzone from '@/components/UploadDropzone'
import PhotoGrid from '@/components/PhotoGrid'
import FaceClusterCard from '@/components/FaceClusterCard'
import DeliveryRow from '@/components/DeliveryRow'
import AssignModal from '@/components/AssignModal'

type Tab = 'upload' | 'people' | 'deliver'

export default function EventDashboard() {
  const { id } = useParams<{ id: string }>()
  const eventId = parseInt(id, 10)

  const [event,       setEvent]       = useState<Event | null>(null)
  const [tab,         setTab]         = useState<Tab>('upload')
  const [photos,      setPhotos]      = useState<UploadedPhoto[]>([])
  const [clusters,    setClusters]    = useState<Cluster[]>([])
  const [deliveries,  setDeliveries]  = useState<DeliveryStatus[]>([])
  const [assignTarget, setAssignTarget] = useState<Cluster | null>(null)
  const [delivering,  setDelivering]  = useState(false)
  const [sendResult,  setSendResult]  = useState<string>('')
  const [loading,     setLoading]     = useState(true)

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [ev, cl, del] = await Promise.all([
          getEvent(eventId),
          getClusters(eventId),
          getDeliveryStatus(eventId),
        ])
        setEvent(ev)
        setClusters(cl)
        setDeliveries(del)
      } catch { /* backend not ready */ }
      finally { setLoading(false) }
    }
    load()
  }, [eventId])

  // ── Refresh people/deliver tabs when switching ────────────────────────────
  useEffect(() => {
    if (tab === 'people') {
      getClusters(eventId).then(setClusters).catch(() => {})
    }
    if (tab === 'deliver') {
      getDeliveryStatus(eventId).then(setDeliveries).catch(() => {})
    }
  }, [tab, eventId])

  const handleUploaded = useCallback((newPhotos: UploadedPhoto[]) => {
    setPhotos(prev => [...prev, ...newPhotos])
  }, [])

  const handleAssigned = useCallback((clusterId: number, lineUserId: string, displayName: string) => {
    setClusters(prev => prev.map(c =>
      c.cluster_id === clusterId ? { ...c, line_user_id: lineUserId, display_name: displayName || c.display_name } : c
    ))
    setDeliveries(prev => prev.map(d =>
      d.cluster_id === clusterId ? { ...d, line_user_id: lineUserId, display_name: displayName || d.display_name } : d
    ))
  }, [])

  async function handleSendAll() {
    setDelivering(true)
    setSendResult('')
    try {
      const res = await deliverAll(eventId)
      const ok  = res.results.filter(r => r.status === 'sent').length
      const err = res.results.filter(r => r.status === 'failed').length
      setSendResult(err ? `Sent ${ok}, failed ${err}.` : `All ${ok} deliveries sent ✓`)
      const fresh = await getDeliveryStatus(eventId)
      setDeliveries(fresh)
    } catch (e) {
      setSendResult(e instanceof Error ? e.message : 'Delivery error.')
    } finally {
      setDelivering(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-base flex items-center justify-center">
        <span className="font-mono text-xs text-primary animate-pulse">Loading event…</span>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-base flex flex-col items-center justify-center gap-4">
        <p className="text-danger text-sm">Event not found or API unreachable.</p>
        <Link href="/events/new" className="text-primary text-sm hover:underline">← Create new event</Link>
      </main>
    )
  }

  const matchedCount = clusters.filter(c => c.line_user_id).length
  const registerUrl  = `${typeof window !== 'undefined' ? window.location.origin : ''}/register/${eventId}`
  const qrUrl        = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registerUrl)}&color=7c6fff&bgcolor=0e1018`

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'upload',  label: 'Upload',  count: photos.length },
    { id: 'people',  label: 'People',  count: clusters.length },
    { id: 'deliver', label: 'Deliver', count: matchedCount },
  ]

  return (
    <main className="min-h-screen bg-base text-[#d4d8ef] flex flex-col">
      {/* ── Top bar ── */}
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-border bg-surface">
        <Link href="/" className="font-display font-extrabold text-base shrink-0">
          snap<span className="text-primary">match</span>
        </Link>
        <span className="text-border">|</span>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-sm truncate">{event.name}</h1>
          <p className="font-mono text-[9px] text-muted">{event.date} · ID {eventId}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Link
            href={`/register/${eventId}`}
            target="_blank"
            className="text-xs border border-border hover:border-primary/40 text-muted hover:text-primary px-3 py-1.5 rounded-sm transition-colors"
          >
            Guest QR →
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-56 border-r border-border bg-surface shrink-0 p-5 gap-6">
          {/* stats */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mb-3">Stats</p>
            <StatsBar eventId={eventId} />
          </div>

          {/* nav */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mb-3">Workflow</p>
            <nav className="space-y-0.5">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm text-left transition-colors',
                    tab === t.id
                      ? 'bg-primary/15 text-primary font-semibold'
                      : 'text-muted hover:text-[#d4d8ef] hover:bg-card',
                  ].join(' ')}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && t.count > 0 && (
                    <span className="font-mono text-[9px] text-dim bg-dim px-1.5 py-0.5 rounded-sm">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* QR code */}
          <div className="mt-auto">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mb-3">Guest Registration</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Guest registration QR"
              className="w-full rounded-sm border border-border opacity-80 hover:opacity-100 transition-opacity"
            />
            <p className="font-mono text-[9px] text-dim mt-2 text-center">Scan to register</p>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* tab bar (mobile) */}
          <div className="flex md:hidden border-b border-border bg-surface">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'flex-1 py-3 text-xs font-semibold transition-colors',
                  tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-muted',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* tab content */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* ══ Upload tab ══ */}
            {tab === 'upload' && (
              <div className="max-w-4xl space-y-6 fade-up">
                <div>
                  <h2 className="font-display font-bold text-xl mb-1">Upload Photos</h2>
                  <p className="text-sm text-muted">
                    Drop your event photos below. Face detection runs automatically in the background —
                    check the People tab once processing completes.
                  </p>
                </div>
                <UploadDropzone eventId={eventId} onUploaded={handleUploaded} />
                {photos.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-3">
                      {photos.length} Photo{photos.length !== 1 ? 's' : ''} Uploaded
                    </p>
                    <PhotoGrid photos={photos} />
                  </div>
                )}
              </div>
            )}

            {/* ══ People tab ══ */}
            {tab === 'people' && (
              <div className="max-w-4xl space-y-6 fade-up">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-xl mb-1">Face Clusters</h2>
                    <p className="text-sm text-muted">
                      Each card is a unique person detected across your photos.
                      Assign a LINE ID to send their photos.
                    </p>
                  </div>
                  <button
                    onClick={() => getClusters(eventId).then(setClusters)}
                    className="shrink-0 text-xs border border-border hover:border-primary/40 text-muted hover:text-primary px-3 py-1.5 rounded-sm transition-colors"
                  >
                    ↺ Refresh
                  </button>
                </div>

                {clusters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm">
                    <div className="text-4xl font-display font-bold text-primary/20 mb-3">◎</div>
                    <p className="text-sm text-muted">No clusters yet.</p>
                    <p className="text-xs text-dim mt-1">Upload photos and wait for face detection to complete.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {clusters.map(c => (
                      <FaceClusterCard
                        key={c.cluster_id}
                        cluster={c}
                        onAssign={setAssignTarget}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ Deliver tab ══ */}
            {tab === 'deliver' && (
              <div className="max-w-3xl space-y-5 fade-up">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-xl mb-1">Deliver Photos</h2>
                    <p className="text-sm text-muted">
                      Send each guest their matched photos via LINE.
                      Only guests with a LINE ID assigned will receive photos.
                    </p>
                  </div>
                  <button
                    onClick={handleSendAll}
                    disabled={delivering || matchedCount === 0}
                    className="shrink-0 bg-primary hover:bg-primary-l disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(124,111,255,0.4)]"
                  >
                    {delivering ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
                        Sending All…
                      </span>
                    ) : 'Send All →'}
                  </button>
                </div>

                {sendResult && (
                  <div className={[
                    'text-sm px-4 py-3 rounded-sm border',
                    sendResult.includes('fail') || sendResult.includes('error')
                      ? 'border-danger/30 bg-danger/5 text-danger'
                      : 'border-success/30 bg-success/5 text-success',
                  ].join(' ')}>
                    {sendResult}
                  </div>
                )}

                {deliveries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm">
                    <div className="text-4xl font-display font-bold text-primary/20 mb-3">↗</div>
                    <p className="text-sm text-muted">No people to deliver to yet.</p>
                    <p className="text-xs text-dim mt-1">Assign LINE IDs in the People tab first.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {deliveries.map(item => (
                      <DeliveryRow
                        key={item.person_id}
                        item={item}
                        eventId={eventId}
                        onSent={() => {
                          setDeliveries(prev =>
                            prev.map(d => d.person_id === item.person_id ? { ...d, status: 'sent' } : d)
                          )
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Assign modal ── */}
      {assignTarget && (
        <AssignModal
          cluster={assignTarget}
          eventId={eventId}
          onClose={() => setAssignTarget(null)}
          onAssigned={handleAssigned}
        />
      )}
    </main>
  )
}
