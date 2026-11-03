import React from 'react'

export const metadata = { robots: { index: false } }

/** Only reached on bare `localhost` / unknown hosts (the Host rewrite skips localhost). */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', padding: 40, lineHeight: 1.6 }}>{children}</body>
    </html>
  )
}
