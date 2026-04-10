import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Organigram Label Generator',
  description: 'Labelling operations tool for Organigram Inc.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
