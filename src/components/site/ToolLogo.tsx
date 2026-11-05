import Image from 'next/image'
import React from 'react'

import { cn } from '@/utilities/ui'

/** Square tool logo (real logo via next/image; tasteful monogram only when no logo is set). */
export const ToolLogo: React.FC<{ src?: string | null; name: string; size?: number; className?: string; priority?: boolean }> = ({
  src,
  name,
  size = 48,
  className,
  priority,
}) => {
  const radius = Math.round(size * 0.24)
  if (src)
    return (
      <span
        className={cn('relative block shrink-0 overflow-hidden bg-white shadow-sm ring-1 ring-black/[0.08] dark:ring-white/10', className)}
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <Image src={src} alt={`${name} logo`} fill sizes={`${size}px`} priority={priority} className="object-cover" />
      </span>
    )
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-[hsl(var(--brand-accent))] font-semibold text-primary-foreground shadow-sm',
        className,
      )}
      style={{ width: size, height: size, fontSize: size / 2.4, borderRadius: radius }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}
