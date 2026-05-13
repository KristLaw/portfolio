'use client'
import { type Cluster } from '@/lib/api'

interface Props {
  cluster: Cluster
  onAssign: (cluster: Cluster) => void
}

export default function FaceClusterCard({ cluster, onAssign }: Props) {
  const assigned = !!cluster.line_user_id

  return (
    <div className={[
      'bg-card border rounded-sm p-4 transition-all group hover:border-primary/40',
      assigned ? 'border-success/30 bg-success/5' : 'border-border opacity-80',
    ].join(' ')}>
      {/* face crops row */}
      <div className="flex gap-1 mb-4">
        {cluster.face_crops.slice(0, 4).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="flex-1 aspect-square object-cover rounded-sm bg-dim border border-border"
            style={{ minWidth: 0 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ))}
        {cluster.face_crops.length === 0 && (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 aspect-square bg-dim rounded-sm border border-border flex items-center justify-center text-dim text-lg">
                ◻
              </div>
            ))}
          </>
        )}
      </div>

      {/* meta */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
            Cluster #{cluster.cluster_id}
          </span>
          {assigned && (
            <span className="w-1.5 h-1.5 rounded-full bg-success" title="Assigned" />
          )}
        </div>
        <p className="text-sm font-medium text-[#d4d8ef] truncate">
          {cluster.display_name ?? (assigned ? cluster.line_user_id : 'Unassigned')}
        </p>
        <p className="font-mono text-[10px] text-muted mt-0.5">
          {cluster.photo_count} photo{cluster.photo_count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* action */}
      <button
        onClick={() => onAssign(cluster)}
        className={[
          'w-full text-xs font-semibold py-2 rounded-sm transition-all',
          assigned
            ? 'border border-success/30 text-success hover:bg-success/10'
            : 'bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20',
        ].join(' ')}
      >
        {assigned ? '✓ Edit Assignment' : '+ Assign LINE ID'}
      </button>
    </div>
  )
}
