'use client'
import { useEffect, useRef, useState } from 'react'
import { assignCluster, type Cluster } from '@/lib/api'

interface Props {
  cluster: Cluster
  eventId: number
  onClose: () => void
  onAssigned: (clusterId: number, lineUserId: string, displayName: string) => void
}

export default function AssignModal({ cluster, eventId, onClose, onAssigned }: Props) {
  const [lineId, setLineId] = useState(cluster.line_user_id ?? '')
  const [name, setName]     = useState(cluster.display_name ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    if (!lineId.trim()) { setError('LINE user ID is required.'); return }
    setLoading(true); setError('')
    try {
      await assignCluster(eventId, cluster.cluster_id, lineId.trim(), name.trim() || undefined)
      onAssigned(cluster.cluster_id, lineId.trim(), name.trim())
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assignment failed.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-sm w-full max-w-md mx-4 p-6 shadow-2xl animate-fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* face crops preview */}
        <div className="flex gap-1 mb-6">
          {cluster.face_crops.slice(0, 4).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              className="w-14 h-14 object-cover rounded-sm border border-border bg-dim"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ))}
          {cluster.face_crops.length === 0 && (
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-dim rounded-sm flex items-center justify-center text-xl">?</div>
              <p className="text-xs text-muted">Face crops still processing…</p>
            </div>
          )}
        </div>

        <h2 className="font-display font-bold text-lg mb-1">Assign LINE ID</h2>
        <p className="text-xs text-muted mb-6">
          Cluster #{cluster.cluster_id} · {cluster.photo_count} photo{cluster.photo_count !== 1 ? 's' : ''}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-1.5">
              LINE User ID <span className="text-danger">*</span>
            </label>
            <input
              ref={inputRef}
              value={lineId}
              onChange={e => setLineId(e.target.value)}
              placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-surface border border-border focus:border-primary text-[#d4d8ef] placeholder-dim px-3 py-2.5 rounded-sm outline-none transition-colors text-sm font-mono"
            />
            <p className="mt-1 text-[10px] text-dim">
              Get this from your LINE OA webhook logs, or ask the guest to message the bot.
            </p>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-muted mb-1.5">
              Display Name <span className="text-dim">(optional)</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah (Bride)"
              className="w-full bg-surface border border-border focus:border-primary text-[#d4d8ef] placeholder-dim px-3 py-2.5 rounded-sm outline-none transition-colors text-sm"
            />
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-border hover:border-border-hi text-muted hover:text-[#d4d8ef] py-2.5 rounded-sm text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary-l disabled:opacity-40 text-white font-semibold py-2.5 rounded-sm text-sm transition-all"
          >
            {loading ? 'Saving…' : 'Assign →'}
          </button>
        </div>
      </div>
    </div>
  )
}
