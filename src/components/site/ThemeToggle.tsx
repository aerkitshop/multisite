'use client'

import { Moon, Sun } from 'lucide-react'
import React from 'react'

import { useTheme } from '@/providers/Theme'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground sm:h-9 sm:w-9"
    >
      {theme === 'dark' ? <Sun aria-hidden className="h-4 w-4" /> : <Moon aria-hidden className="h-4 w-4" />}
    </button>
  )
}
