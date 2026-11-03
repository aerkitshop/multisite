import React from 'react'

/**
 * Every outbound tool link goes through /go/<slug> so clicks are logged and
 * affiliate URLs never appear in the HTML.
 */
export const goHref = (slug: string, from?: string) =>
  `/go/${encodeURIComponent(slug)}${from ? `?src=${encodeURIComponent(from)}` : ''}`

export const OutboundLink: React.FC<
  { slug: string; from?: string; className?: string; children: React.ReactNode; title?: string }
> = ({ slug, from, className, children, title }) => (
  <a href={goHref(slug, from)} target="_blank" rel="sponsored nofollow noopener" className={className} title={title}>
    {children}
  </a>
)
