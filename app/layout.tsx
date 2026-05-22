import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Suno Writer — AI Song Prompt Builder',
  description: 'Build perfect Suno prompts. Lyrics + arrangement in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
