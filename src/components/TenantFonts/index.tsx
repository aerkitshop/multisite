import React from 'react'

import type { Site } from '@/payload-types'
import { fontMapping, generateGoogleFontsUrl, type FontSlug } from '@/utilities/fontMapping'

export function TenantFonts({ site }: { site: Site }) {
  const fonts = [site.fonts?.heading, site.fonts?.body].filter(
    (f): f is FontSlug => Boolean(f && f in fontMapping),
  )
  if (fonts.length === 0) return null
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={generateGoogleFontsUrl(fonts)} rel="stylesheet" />
    </>
  )
}
