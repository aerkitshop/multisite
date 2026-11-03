import React from 'react'

export const JsonLd: React.FC<{ data: Record<string, unknown> | Record<string, unknown>[] }> = ({ data }) => (
  <script
    type="application/ld+json"
    // Escape "<" so content can never close the script tag.
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
)
