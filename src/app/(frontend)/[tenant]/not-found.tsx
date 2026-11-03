import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="container py-28 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-3 text-muted-foreground">This page could not be found.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        Back home
      </Link>
    </div>
  )
}
