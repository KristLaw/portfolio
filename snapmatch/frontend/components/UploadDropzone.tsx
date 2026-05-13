'use client'
import { useRef, useState, useCallback, DragEvent } from 'react'
import { uploadPhotos, type UploadedPhoto } from '@/lib/api'

interface Props {
  eventId: number
  onUploaded: (photos: UploadedPhoto[]) => void
}

interface FileEntry {
  name: string
  progress: number   // 0–100
  status: 'queued' | 'uploading' | 'done' | 'error'
}

export default function UploadDropzone({ eventId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [entries, setEntries] = useState<FileEntry[]>([])

  const updateEntry = useCallback((name: string, patch: Partial<FileEntry>) => {
    setEntries(prev => prev.map(e => e.name === name ? { ...e, ...patch } : e))
  }, [])

  async function processFiles(files: File[]) {
    if (!files.length) return
    const images = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f.name))
    if (!images.length) return

    const newEntries: FileEntry[] = images.map(f => ({ name: f.name, progress: 0, status: 'queued' }))
    setEntries(prev => [...prev, ...newEntries])

    // Upload all in one request, track overall progress
    images.forEach(f => updateEntry(f.name, { status: 'uploading' }))
    try {
      const result = await uploadPhotos(eventId, images, (loaded, total) => {
        const pct = Math.round((loaded / total) * 90)
        images.forEach(f => updateEntry(f.name, { progress: pct }))
      })
      images.forEach(f => updateEntry(f.name, { progress: 100, status: 'done' }))
      onUploaded(result.photos)
    } catch {
      images.forEach(f => updateEntry(f.name, { status: 'error' }))
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    processFiles(files)
    e.target.value = ''
  }

  const uploading = entries.some(e => e.status === 'uploading')

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-3 h-48 border-2 border-dashed rounded-sm cursor-pointer transition-all',
          dragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-primary/5',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="text-3xl font-display font-bold text-primary/60 select-none">↑</div>
        <div className="text-sm text-muted text-center select-none">
          <span className="text-[#d4d8ef] font-medium">Drop photos here</span>
          <br />
          <span className="text-xs">or click to browse — JPEG, PNG, WEBP</span>
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base/60 rounded-sm">
            <span className="text-sm text-primary font-mono animate-pulse">Processing…</span>
          </div>
        )}
      </div>

      {/* File list */}
      {entries.length > 0 && (
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div key={entry.name} className="flex items-center gap-3 bg-card border border-border px-3 py-2 rounded-sm text-xs">
              <span
                className={[
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  entry.status === 'done'      ? 'bg-success' :
                  entry.status === 'error'     ? 'bg-danger'  :
                  entry.status === 'uploading' ? 'bg-primary animate-pulse' :
                  'bg-dim',
                ].join(' ')}
              />
              <span className="flex-1 text-muted truncate font-mono">{entry.name}</span>
              {entry.status === 'uploading' && (
                <div className="w-20 h-1 bg-dim rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              )}
              {entry.status === 'done'  && <span className="text-success">✓</span>}
              {entry.status === 'error' && <span className="text-danger">✕</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
