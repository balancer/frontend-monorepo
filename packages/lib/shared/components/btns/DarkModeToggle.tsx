'use client'

import { Button, useColorMode } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'react-feather'

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { colorMode, toggleColorMode } = useColorMode()

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

  if (!mounted) {
    return (
      <Button isDisabled p="0" variant="tertiary">
        <Moon size={18} />
      </Button>
    )
  }

  return (
    <Button onClick={toggleColorMode} p="0" variant="tertiary">
      <AnimatePresence initial={false}>
        {colorMode === 'dark' ? (
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
