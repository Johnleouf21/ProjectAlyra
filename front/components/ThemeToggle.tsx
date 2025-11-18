'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only runs on client after hydration
  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  // During SSR and first render on client, show a neutral button
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  // After hydration, show the actual theme toggle
  const currentTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
