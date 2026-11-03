import React from 'react'

import type { Site } from '@/payload-types'
import { fontMapping, type FontSlug } from '@/utilities/fontMapping'
import { hexToHsl } from '@/utilities/hexToHsl'

const expand = (hex?: string | null) => {
  if (!hex) return hex
  const h = hex.replace('#', '')
  return h.length === 3 ? `#${h.split('').map((c) => c + c).join('')}` : hex
}

/** "H S% L%" -> same hue/saturation with lightness >= min. */
const liftLightness = (hsl: string, min: number) => {
  const m = hsl.match(/^(\S+)\s+(\S+)%\s+(\S+)%$/)
  if (!m) return hsl
  return `${m[1]} ${m[2]}% ${Math.max(Number(m[3]), min)}%`
}

/** Injects the site's colours & fonts as CSS variables (light + dark). */
export const TenantStyles: React.FC<{ site: Site }> = ({ site }) => {
  const c = site.colors || {}
  const v = (hex?: string | null) => hexToHsl(expand(hex) ?? null)
  const light: string[] = []
  const dark: string[] = []
  const primary = v(c.primary)
  if (primary) {
    const fg = v(c.primaryForeground) || '0 0% 100%'
    for (const arr of [light, dark]) arr.push(`--primary:${primary};`, `--primary-foreground:${fg};`, `--ring:${primary};`)
    // Brand-coloured text (badges, links). Dark brand colours (e.g. teal 26% L) are unreadable on the
    // dark background, so in dark mode the lightness is raised to at least 70%.
    light.push(`--primary-text:${primary};`)
    dark.push(`--primary-text:${liftLightness(primary, 70)};`)
  }
  const accent = v(c.accent)
  if (accent) for (const arr of [light, dark]) arr.push(`--brand-accent:${accent};`)
  const bg = v(c.background)
  if (bg) light.push(`--background:${bg};`)
  const fg = v(c.foreground)
  if (fg) light.push(`--foreground:${fg};`)
  const darkBg = v(c.darkBackground)
  dark.push(`--background:${darkBg || '240 10% 4%'};`)
  // Light-mode foreground must not leak into dark mode.
  dark.push('--foreground:0 0% 96%;')

  const heading = fontMapping[(site.fonts?.heading || 'inter') as FontSlug]
  const body = fontMapping[(site.fonts?.body || 'inter') as FontSlug]
  if (heading) light.push(`--font-heading:${heading.cssVariable};`)
  if (body) light.push(`--font-body:${body.cssVariable};`)

  // html[data-theme=dark] (0,1,1) beats :root (0,1,0) regardless of stylesheet order.
  const css = `:root{${light.join('')}}html[data-theme='dark']{${dark.join('')}}`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
