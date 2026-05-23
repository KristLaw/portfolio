import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grizzz — AI Face Detection · Photo Delivery',
  description: 'Upload event photos. AI finds every face. Guests get their moments on LINE — automatically. No login required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
