import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Celebal JWT Auth',
  description: 'Created By Nishant Kumar Gupta',
  generator: 'Nishant Kumar Gupta',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
