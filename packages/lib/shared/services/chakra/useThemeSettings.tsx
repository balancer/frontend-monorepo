'use client'

import { createContext, PropsWithChildren } from 'react'
import { useOptionalContext } from '@repo/lib/shared/utils/contexts'

interface ThemeSettings {
  hideDarkModeToggle: boolean
}

const defaultSettings: ThemeSettings = {
  hideDarkModeToggle: false,
}

const ThemeSettingsContext = createContext<ThemeSettings | null>(null)

export function useThemeSettings(): ThemeSettings {
  const settings = useOptionalContext(ThemeSettingsContext)
  return settings ?? defaultSettings
}

export function ThemeSettingsProvider({
  children,
  settings,
}: PropsWithChildren<{ settings?: Partial<ThemeSettings> }>) {
  const mergedSettings = { ...defaultSettings, ...settings }

  return (
    <ThemeSettingsContext.Provider value={mergedSettings}>{children}</ThemeSettingsContext.Provider>
  )
}
