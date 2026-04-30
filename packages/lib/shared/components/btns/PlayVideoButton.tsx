'use client'

import { TriangleDownIcon } from '@chakra-ui/icons'
import { IconButton, type IconButtonProps } from '@chakra-ui/react'

export type PlayVideoButtonProps = {
  /** Width and height in pixels */
  size?: number
} & Omit<IconButtonProps, 'aria-label' | 'icon' | 'size' | 'h' | 'w'>

export function PlayVideoButton({
  size = 24,
  isRound = true,
  shadow = 'md',
  variant = 'primary',
  ...rest
}: PlayVideoButtonProps) {
  return (
    <IconButton
      {...rest}
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
      isRound={isRound}
      shadow={shadow}
      variant={variant}
      w={size}
    />
  )
}
