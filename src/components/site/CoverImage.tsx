import Image from 'next/image'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * 16:9 cover. Real image via next/image (lazy, responsive `sizes`); when a tool has no image yet,
 * a brand gradient with the logo / initial so the grid never shows an empty box.
 */
export const CoverImage: React.FC<{
  src?: string | null
  alt: string
  sizes: string
  priority?: boolean
  fallbackLabel?: string
  className?: string
  imgClassName?: string
}> = ({ src, alt, sizes, priority, fallbackLabel, className, imgClassName }) => (
  <div className={cn('relative aspect-video overflow-hidden bg-muted', className)}>
    {src ? (
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn('object-cover', imgClassName)} />
    ) : (
      <div
        aria-hidden
        className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_120%_at_0%_0%,hsl(var(--primary)/0.85),hsl(var(--brand-accent)/0.7)_60%,hsl(var(--primary)/0.4))]"
      >
        {fallbackLabel && <span className="text-4xl font-bold tracking-tight text-white/90 drop-shadow">{fallbackLabel}</span>}
      </div>
    )}
  </div>
)
