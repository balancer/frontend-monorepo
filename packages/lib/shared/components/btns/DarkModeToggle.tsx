'use client'
import { Button } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'react-feather'
import { AnalyticsEvent, trackEvent } from '../../services/fathom/Fathom'

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme()

  function toggleColorMode() {
    trackEvent(AnalyticsEvent.ClickNavUtilitiesDarkmode)
    setTheme(theme == 'light' ? 'dark' : 'light')
  }

  const animationSun = {
    initial: { rotate: 0, scale: 0, opacity: 0 },
    animate: { rotate: 90, scale: 1, opacity: 1 },
    exit: { rotate: 0, scale: 0, opacity: 0 },
  }

  const animationMoon = {
    initial: { rotate: 90, scale: 0, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 90, scale: 0, opacity: 0 },
  }

  return (
    <Button onClick={toggleColorMode} p="0" variant="tertiary">
      <AnimatePresence initial={false}>
        {theme === 'light' ? (
          <motion.i {...animationSun}>
            <Sun size={18} />
          </motion.i>
        ) : (
          <motion.i {...animationMoon}>
            <Moon size={18} />
          </motion.i>
        )}
      </AnimatePresence>
    </Button>
  )
}
