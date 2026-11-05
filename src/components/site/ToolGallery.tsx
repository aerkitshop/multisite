'use client'

import Image from 'next/image'
import React, { useState } from 'react'

import { cn } from '@/utilities/ui'

export type GalleryImage = { src: string; alt: string }

/** Tool page hero: one large 16:9 image; thumbnails underneath switch it when there is more than one. */
export const ToolGallery: React.FC<{ images: GalleryImage[]; name: string }> = ({ images, name }) => {
  const [active, setActive] = useState(0)
  if (images.length === 0) return null
  const main = images[Math.min(active, images.length - 1)]
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted shadow-[0_24px_48px_-24px_rgba(16,24,40,0.35)]">
        <Image
          key={main.src}
          src={main.src}
          alt={main.alt || `${name} screenshot`}
          fill
          priority
          sizes="(min-width: 1280px) 860px, (min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label={`${name} images`}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === active}
                className={cn(
                  'relative block aspect-video w-28 overflow-hidden rounded-lg border bg-muted transition sm:w-36',
                  i === active ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-70 hover:opacity-100',
                )}
              >
                <Image src={img.src} alt="" fill sizes="144px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
