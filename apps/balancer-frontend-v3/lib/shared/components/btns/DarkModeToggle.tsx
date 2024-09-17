/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Button, useColorMode } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'react-feather'

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { setColorMode } = useColorMode()

  function toggleColorMode() {
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setColorMode(theme)
  }, [theme])

  if (!mounted) {
    return (
      <Button variant="tertiary" p="0" isDisabled>
        <Moon size={18} />
      </Button>
    )
  }

  return (
    <Button onClick={toggleColorMode} variant="tertiary" p="0">
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
