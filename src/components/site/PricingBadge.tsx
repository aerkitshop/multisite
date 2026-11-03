import React from 'react'

import { cn } from '@/utilities/ui'

const styles: Record<string, string> = {
  free: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
  freemium: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/30',
  trial: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',
  paid: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/30',
}
const labels: Record<string, string> = { free: 'Free', freemium: 'Freemium', trial: 'Free trial', paid: 'Paid' }

export const PricingBadge: React.FC<{ model?: string | null; className?: string }> = ({ model, className }) => {
  if (!model) return null
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[model] || 'bg-muted text-muted-foreground ring-border',
        className,
      )}
    >
      {labels[model] || model}
    </span>
  )
}
