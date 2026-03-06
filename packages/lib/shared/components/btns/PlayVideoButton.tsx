'use client'

import { IconButton, Icon } from '@chakra-ui/react'
import { LuTriangle } from 'react-icons/lu'

export function PlayVideoButton({ size = 24 }: { size?: number }) {
  return (
    <IconButton
      aria-label="Play video"
      h={size}
      rounded="full"
      shadow="md"
      variant="primary"
      w={size}
    >
      <Icon
        asChild
        color="#000"
        h={size / 2}
        mr="-2px"
        style={{ transform: 'rotate(270deg)' }}
        w={size / 2}
      >
        <LuTriangle />
      </Icon>
    </IconButton>
  )
}
