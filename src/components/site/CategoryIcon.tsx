import { CalendarCheck, Clapperboard, LayoutGrid, MessageCircle, Mic, PenLine, Scissors, Sparkles, type LucideIcon } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

/** Category `icon` holds a lucide icon name (or, for older data, an emoji which is rendered as-is). */
const icons: Record<string, LucideIcon> = {
  all: LayoutGrid,
  clapperboard: Clapperboard,
  mic: Mic,
  scissors: Scissors,
  'pen-line': PenLine,
  'calendar-check': CalendarCheck,
  'message-circle': MessageCircle,
  sparkles: Sparkles,
}

export const CategoryIcon: React.FC<{ icon?: string | null; className?: string }> = ({ icon, className }) => {
  const Icon = icon ? icons[icon] : undefined
  if (Icon) return <Icon aria-hidden className={cn('h-4 w-4', className)} strokeWidth={1.75} />
  if (icon) return <span aria-hidden className={cn('inline-block w-4 text-center text-sm leading-4', className)}>{icon}</span>
  return <Sparkles aria-hidden className={cn('h-4 w-4', className)} strokeWidth={1.75} />
}
