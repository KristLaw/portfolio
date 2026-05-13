'use client'
import { useState } from 'react'

interface Photo {
  id: number
  filename: string
  url: string
}

interface Props {
  photos: Photo[]
}

export default function PhotoGrid({ photos }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (!photos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted border border-dashed border-border rounded-sm">
        <div className="text-4xl font-display font-bold text-primary/20 mb-3">◻</div>
        <p className="text-sm">Photos will appear here after upload.</p>
        <p className="text-xs text-dim mt-1">Face detection runs automatically in the background.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {photos.map(photo => (
        <div
          key={photo.id}
          className="relative aspect-square bg-card border border-border rounded-sm overflow-hidden group cursor-pointer"
          onMouseEnter={() => setHovered(photo.id)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* hover overlay — shows face bbox hint */}
          <div className={[
            'absolute inset-0 bg-base/60 flex flex-col items-center justify-center gap-1 transition-opacity duration-200',
            hovered === photo.id ? 'opacity-100' : 'opacity-0',
          ].join(' ')}>
            {/* simulated face bbox overlay */}
            <div className="absolute inset-[25%] border-2 border-success rounded-sm pointer-events-none"
              style={{ boxShadow: '0 0 12px rgba(34,217,126,0.4)' }}>
              <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-success" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-success" />
              <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-success" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-success" />
            </div>
            <span className="relative z-10 font-mono text-[10px] text-success bg-base/80 px-2 py-0.5 rounded-sm">
              Processing…
            </span>
          </div>

          {/* filename chip */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-base/90 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-mono text-[9px] text-muted truncate">{photo.filename}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
