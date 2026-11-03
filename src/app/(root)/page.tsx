/* eslint-disable @next/next/no-html-link-for-pages -- /admin lives in another root layout; a full page load is intended */
import React from 'react'

export default function Index() {
  return (
    <main>
      <h1>Multisite</h1>
      <p>
        This host is not mapped to a site. Open a site domain (e.g. <code>http://creator-ai.localhost:3000</code>) or the{' '}
        <a href="/admin">admin panel</a>.
      </p>
    </main>
  )
}
