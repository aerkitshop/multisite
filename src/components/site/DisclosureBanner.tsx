import Link from 'next/link'
import React from 'react'

export const DisclosureBanner: React.FC<{ text?: string | null }> = ({ text }) => {
  if (!text) return null
  return (
    <div className="border-b bg-primary/5 text-xs text-muted-foreground" role="note">
      <div className="container py-2 text-center">
        <span className="font-medium text-foreground">Disclosure:</span> {text}{' '}
        <Link href="/disclosure" className="underline underline-offset-2 hover:text-foreground">
          Learn more
        </Link>
      </div>
    </div>
  )
}
