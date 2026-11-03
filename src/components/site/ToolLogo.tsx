/* eslint-disable @next/next/no-img-element */
import React from 'react'

import { cn } from '@/utilities/ui'

export const ToolLogo: React.FC<{ src?: string | null; name: string; size?: number; className?: string }> = ({
  src,
  name,
  size = 48,
  className,
}) => {
  if (src)
    return (
      <img
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        className={cn('shrink-0 rounded-xl border bg-white object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  return (
    <div
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground', className)}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}
