'use client'

import { TriangleDownIcon } from '@chakra-ui/icons'
import { IconButton } from '@chakra-ui/react'

export function PlayVideoButton({ size = 24 }: { size?: number }) {
  return (
    <IconButton
      aria-label="Play video"
      h={size}
      icon={
        <TriangleDownIcon
          color="#000"
          h={size / 2}
          mr="-2px"
          style={{ transform: 'rotate(270deg)' }}
          w={size / 2}
        />
      }
      isRound
      minW={size}
      shadow="md"
      variant="primary"
      w={size}
    />
  )
}
