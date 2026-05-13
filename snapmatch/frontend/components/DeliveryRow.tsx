'use client'
import { useState } from 'react'
import { deliverOne, type DeliveryStatus } from '@/lib/api'

interface Props {
  item: DeliveryStatus
  eventId: number
  onSent: (personId: number) => void
}

const STATUS_CONFIG = {
  pending: { label: 'Pending',   color: 'text-muted',   bg: 'bg-dim/50',        dot: 'bg-muted' },
  sent:    { label: 'Sent ✓',    color: 'text-success',  bg: 'bg-success/10',    dot: 'bg-success' },
  failed:  { label: 'Failed',    color: 'text-danger',   bg: 'bg-danger/10',     dot: 'bg-danger' },
}

export default function DeliveryRow({ item, eventId, onSent }: Props) {
  const [sending, setSending] = useState(false)
  const [status, setStatus]   = useState<DeliveryStatus['status']>(item.status)
  const cfg = STATUS_CONFIG[status]

  async function handleSend() {
    if (!item.line_user_id || sending) return
    setSending(true)
    try {
      const result = await deliverOne(eventId, item.person_id)
      const outcome = result.results[0]
      const next = outcome?.status === 'sent' ? 'sent' : 'failed'
      setStatus(next)
      if (next === 'sent') onSent(item.person_id)
    } catch {
      setStatus('failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-card border border-border rounded-sm hover:border-border-hi transition-colors">
      {/* dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

      {/* identity */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#d4d8ef] truncate">
          {item.display_name ?? (item.line_user_id ? 'Guest' : <span className="text-dim italic">No LINE ID</span>)}
        </p>
        <p className="font-mono text-[10px] text-muted truncate">
          {item.line_user_id ?? 'Unassigned — assign a LINE ID first'}
        </p>
      </div>

      {/* photo count */}
      <div className="flex-shrink-0 text-center">
        <div className="font-display font-bold text-sm text-primary">{item.photo_count}</div>
        <div className="font-mono text-[9px] text-muted uppercase">photos</div>
      </div>

      {/* status badge */}
      <div className={`flex-shrink-0 px-2.5 py-1 rounded-sm text-xs font-mono ${cfg.color} ${cfg.bg}`}>
        {cfg.label}
      </div>

      {/* send button */}
      <button
        onClick={handleSend}
        disabled={!item.line_user_id || sending || status === 'sent'}
        className="flex-shrink-0 bg-primary/10 border border-primary/25 hover:bg-primary/25 disabled:opacity-30 disabled:cursor-not-allowed text-primary text-xs font-semibold px-3 py-1.5 rounded-sm transition-colors"
      >
        {sending ? (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 border border-primary/40 border-t-primary rounded-full animate-spin" />
            Sending
          </span>
        ) : status === 'sent' ? 'Resend' : 'Send'}
      </button>
    </div>
  )
}
