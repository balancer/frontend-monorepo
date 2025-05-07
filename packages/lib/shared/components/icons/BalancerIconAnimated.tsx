'use client'

import { useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

export function BalancerLogoAnimated({
  iconColor,
  noShadow,
  size = 128,
}: {
  iconColor?: string
  noShadow?: boolean
  size?: number
}) {
  const _iconColor = useColorModeValue('#2D3239', '#E5D3BE')

  return (
    <motion.div
      style={{
        filter: noShadow ? 'none' : 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))',
        padding: '16px',
        borderRadius: '50%',
      }}
    >
      <motion.svg
        fill="none"
        height={size}
        viewBox="0 0 32 32"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bottom rock */}
        <motion.path
          animate={{ y: [0, -1, 0] }}
          d="M26.106 20.939c0 1.924-4.525 3.482-10.105 3.482S5.896 22.862 5.896 20.939c0-1.924 4.525-3.482 10.105-3.482s10.105 1.558 10.105 3.482z"
          fill={iconColor || _iconColor}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
            delay: 1,
          }}
        />
        {/* Middle rock */}
        <motion.path
          animate={{ y: [0, -1.5, 0] }}
          d="M24.107 14.718c0 1.529-3.63 2.768-8.106 2.768-4.477 0-8.106-1.24-8.106-2.768 0-1.529 3.63-2.768 8.106-2.768 4.476 0 8.106 1.24 8.106 2.768z"
          fill={iconColor || _iconColor}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
            delay: 1,
          }}
        />
        {/* Top rock */}
        <motion.path
          animate={{ y: [0, -2, 0] }}
          d="M22.108 9.676c0 1.157-2.718 2.095-6.07 2.095-3.353 0-6.07-.938-6.07-2.095 0-1.158 2.717-2.096 6.07-2.096 3.352 0 6.07.938 6.07 2.096z"
          fill={iconColor || _iconColor}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.2,
            delay: 1,
          }}
        />
      </motion.svg>
    </motion.div>
  )
}
