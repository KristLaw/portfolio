const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Event {
  id: number
  name: string
  date: string
}

export interface Stats {
  photos: number
  faces: number
  matched: number
  delivered: number
}

export interface UploadedPhoto {
  id: number
  filename: string
  url: string
}

export interface UploadResult {
  uploaded: number
  photos: UploadedPhoto[]
}

export interface Cluster {
  cluster_id: number
  person_id: number
  display_name: string | null
  line_user_id: string | null
  photo_count: number
  face_crops: string[]
}

export interface DeliveryStatus {
  person_id: number
  cluster_id: number
  display_name: string | null
  line_user_id: string | null
  photo_count: number
  status: 'pending' | 'sent' | 'failed'
}

export interface DeliveryResult {
  person_id: number
  line_user_id: string
  photos_sent: number
  status: string
  error: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

function formBody(data: Record<string, string | undefined>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && v !== '') fd.append(k, v)
  }
  return fd
}

// ── API client ─────────────────────────────────────────────────────────────

export function createEvent(data: {
  name: string
  date: string
  line_channel_token?: string
}): Promise<Event> {
  return apiFetch('/events', {
    method: 'POST',
    body: formBody({ name: data.name, date: data.date, line_channel_token: data.line_channel_token }),
  })
}

export function getEvent(id: number): Promise<Event> {
  return apiFetch(`/events/${id}`)
}

export function getStats(id: number): Promise<Stats> {
  return apiFetch(`/events/${id}/stats`)
}

export async function uploadPhotos(
  eventId: number,
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadResult> {
  const fd = new FormData()
  files.forEach(f => fd.append('files', f))

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API}/events/${eventId}/photos/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded, e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as UploadResult)
      } else {
        reject(new Error(xhr.responseText || `HTTP ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(fd)
  })
}

export function getClusters(eventId: number): Promise<Cluster[]> {
  return apiFetch(`/events/${eventId}/clusters`)
}

export function assignCluster(
  eventId: number,
  clusterId: number,
  lineUserId: string,
  displayName?: string,
): Promise<{ success: boolean; person_id: number }> {
  return apiFetch(`/events/${eventId}/clusters/${clusterId}/assign`, {
    method: 'POST',
    body: formBody({ line_user_id: lineUserId, display_name: displayName }),
  })
}

export function getDeliveryStatus(eventId: number): Promise<DeliveryStatus[]> {
  return apiFetch(`/events/${eventId}/delivery-status`)
}

export function deliverAll(eventId: number): Promise<{ results: DeliveryResult[] }> {
  return apiFetch(`/events/${eventId}/deliver`, {
    method: 'POST',
    body: formBody({}),
  })
}

export function deliverOne(
  eventId: number,
  personId: number,
): Promise<{ results: DeliveryResult[] }> {
  return apiFetch(`/events/${eventId}/deliver`, {
    method: 'POST',
    body: formBody({ person_id: String(personId) }),
  })
}
